// TODO: Reorganize this file into credentials package

import { createElysia } from '../utils'
import { t } from 'elysia'
import { keccak256, zeroAddress, pad, concat, toHex } from 'viem'
import { Credential, CredentialType, getChain } from '@anonworld/common'
import { db } from '../db'
import { CredentialsManager } from '@anonworld/credentials'
import { feed } from '../services/feed'
import { redis } from '../services/redis'
import { TokenBalancePublicData } from '@anonworld/credentials/src/verifiers/token-balance'
import { FarcasterFidPublicData } from '@anonworld/credentials/src/verifiers/farcaster-fid'
import { NativeBalancePublicData } from '@anonworld/credentials/src/verifiers/native-balance'
import { claimNotesTable } from '../db/schema'
import { inArray } from 'drizzle-orm'

const manager = new CredentialsManager()

export const credentialsRoutes = createElysia({ prefix: '/credentials' })
  .post(
    '/',
    async ({ body }) => {
      console.time('total_credential_creation')
      console.time('validation')
      if (!body.type || !body.version) {
        throw new Error('Invalid type or version')
      }

      const credentialType = body.type as CredentialType
      const circuit = manager.getVerifier(credentialType, body.version)
      console.timeEnd('validation')

      console.time('verify_proof')
      const verified = await circuit.verifyProof({
        proof: new Uint8Array(body.proof),
        publicInputs: body.publicInputs,
      })
      if (!verified) {
        throw new Error('Invalid proof')
      }
      console.timeEnd('verify_proof')

      console.time('check_existing')
      let credentialId = ''
      const id = keccak256(new Uint8Array(body.proof))
      const existingCredential = await db.credentials.get(id)
      if (existingCredential) {
        console.timeEnd('check_existing')
        console.timeEnd('total_credential_creation')
        return {
          ...existingCredential,
          proof: undefined,
        }
      }
      console.timeEnd('check_existing')

      console.time('get_metadata_and_block')
      const metadata = circuit.parseData(body.publicInputs)
      const chain = getChain(metadata.chainId)
      const block = await chain.client.getBlock({
        blockNumber: BigInt(metadata.blockNumber),
      })
      console.timeEnd('get_metadata_and_block')

      console.time('verify_by_type')
      switch (credentialType) {
        case CredentialType.ERC20_BALANCE:
        case CredentialType.ERC721_BALANCE: {
          const typedMetadata = metadata as TokenBalancePublicData
          const address = typedMetadata.tokenAddress
          credentialId = `${body.type}:${typedMetadata.chainId}:${address.toLowerCase()}`
          const slot = typedMetadata.balanceSlot

          console.time('token_balance_proof')
          const ethProof = await chain.client.getProof({
            address: address as `0x${string}`,
            storageKeys: [keccak256(concat([pad(zeroAddress), pad(toHex(slot))]))],
            blockNumber: BigInt(metadata.blockNumber),
          })
          console.timeEnd('token_balance_proof')

          if (ethProof.storageHash !== typedMetadata.storageHash) {
            throw new Error('Invalid storage hash')
          }
          break
        }
        case CredentialType.FARCASTER_FID: {
          const typedMetadata = metadata as FarcasterFidPublicData
          credentialId = `${body.type}:${typedMetadata.chainId}:${typedMetadata.fid}`
          const slot = typedMetadata.storageSlot

          console.time('farcaster_proof')
          const ethProof = await chain.client.getProof({
            address: typedMetadata.contractAddress as `0x${string}`,
            storageKeys: [keccak256(concat([pad(zeroAddress), pad(toHex(slot))]))],
            blockNumber: BigInt(metadata.blockNumber),
          })
          console.timeEnd('farcaster_proof')

          if (ethProof.storageHash !== typedMetadata.storageHash) {
            throw new Error('Invalid storage hash')
          }
          break
        }
        case CredentialType.NATIVE_BALANCE: {
          const typedMetadata = metadata as NativeBalancePublicData
          credentialId = `${body.type}:${typedMetadata.chainId}`

          console.log(block.stateRoot, typedMetadata.stateRoot)
          if (block.stateRoot !== typedMetadata.stateRoot) {
            throw new Error('Invalid state root')
          }
          break
        }
      }
      console.timeEnd('verify_by_type')

      console.time('get_parent')
      let parent: Credential | null = null
      if (body.parentId) {
        parent = await db.credentials.get(body.parentId)
      }
      console.timeEnd('get_parent')

      console.time('create_credential')
      const credential = await db.credentials.create({
        id,
        hash: keccak256(id),
        type: credentialType,
        credential_id: credentialId,
        metadata,
        version: circuit.version,
        proof: {
          proof: body.proof,
          publicInputs: body.publicInputs,
        },
        verified_at: new Date(Number(block.timestamp) * 1000),
        parent_id: parent?.parent_id ?? parent?.id ?? id,
        vault_id: parent?.vault_id,
      })
      console.timeEnd('create_credential')

      console.time('reverify_parent')
      if (parent?.id) {
        await db.credentials.reverify(parent.id, credential.id)
      }
      console.timeEnd('reverify_parent')

      console.timeEnd('total_credential_creation')
      return {
        ...credential,
        proof: undefined,
      }
    },
    {
      body: t.Object({
        type: t.String(),
        version: t.String(),
        proof: t.Array(t.Number()),
        publicInputs: t.Array(t.String()),
        parentId: t.Optional(t.String()),
      }),
    }
  )
  .get('/:hash', async ({ params, error }) => {
    let credential = await db.credentials.getByHash(params.hash)
    if (credential?.reverified_id) {
      credential = await db.credentials.get(credential.parent_id)
    }

    if (!credential) {
      return error(404, 'Credential not found')
    }

    return {
      ...credential,
      id: undefined,
      proof: undefined,
      parent_id: undefined,
      reverified_id: undefined,
    }
  })
  .get('/:hash/posts', async ({ params, error }) => {
    const cached = await redis.getCredentialPostsFeed(params.hash)
    if (cached) {
      return { data: JSON.parse(cached) }
    }

    const credential = await db.credentials.getByHash(params.hash)
    if (!credential) {
      return error(404, 'Credential not found')
    }

    const children = await db.credentials.getChildren(credential.parent_id)
    const credentialPosts = await db.credentials.getPostsForCredentialIds(
      children.map((c) => c.id)
    )
    const hashes = credentialPosts.map((p) => p.post_hash)
    if (hashes.length === 0) return { data: [] }

    const posts = await db.posts.getFeedForHashes(hashes)
    const result = await feed.getFeed(posts.map((p) => p.posts))
    const data = result.filter((p) => !p.parent_hash && p.author.fid === 899289)

    await redis.setCredentialPostsFeed(params.hash, JSON.stringify(data))

    return {
      data,
    }
  })
  .post(
    '/claims',
    async ({ body, error }) => {
      const data = await db.db
        .select()
        .from(claimNotesTable)
        .where(inArray(claimNotesTable.credential_id, body.credentialIds))
      return { data }
    },
    {
      body: t.Object({
        credentialIds: t.Array(t.String()),
      }),
    }
  )
