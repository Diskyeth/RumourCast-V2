import { createElysia } from '../utils'
import { t } from 'elysia'
import { ProofType, verifyProof } from '@anon/utils/src/proofs'
import { verifyMessage, zeroAddress } from 'viem'
import { CreatePostParams, SubmitHashParams } from '../services/types'
import { neynar } from '../services/neynar'
import { promoteToTwitter, twitterClient } from '../services/twitter'
import {
  createPostMapping,
  createPostReveal,
  deletePostMapping,
  getPostMapping,
  markPostReveal,
} from '@anon/db'
import { getQueue, QueueName } from '@anon/queue/src/utils'
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg'
import { getValidRoots } from '@anon/utils/src/merkle-tree'
import { augmentCasts } from './feed'

export const postRoutes = createElysia({ prefix: '/posts' })
  .post(
    '/submit',
    async ({ body }) => {
      if (body.type === ProofType.PROMOTE_POST) {
        await getQueue(QueueName.PromotePost).add(`${body.type}-${Date.now()}`, body)
      } else {
        await getQueue(QueueName.Default).add(`${body.type}-${Date.now()}`, body)
      }
    },
    {
      body: t.Object({
        type: t.Enum(ProofType),
        proof: t.Array(t.Number()),
        publicInputs: t.Array(t.Array(t.Number())),
      }),
    }
  )
  .post(
    '/create',
    async ({ body }) => {
      const isValid = await verifyProof(ProofType.CREATE_POST, {
        proof: new Uint8Array(body.proof),
        publicInputs: body.publicInputs.map((i) => new Uint8Array(i)),
      })
      if (!isValid) {
        throw new Error('Invalid proof')
      }
      const params = extractCreatePostData(body.publicInputs)

      await validateRoot(ProofType.CREATE_POST, params.tokenAddress, params.root)

      const result = await neynar.post(params)

      if (BigInt(params.revealHash) != BigInt(0) && 'cast' in result) {
        await createPostReveal(
          result.cast.hash.toLowerCase(),
          params.revealHash.toLowerCase()
        )

        const parentHash = cast.cast.parent_hash
        const channelId = cast.cast.channel?.id
        const embeds: string[] = []
        let quoteHash: string | undefined
        for (const embed of cast.cast.embeds || []) {
          if (embed.url) {
            embeds.push(embed.url)
          } else if (embed.cast) {
            quoteHash = embed.cast.hash
          }
        }

        const bestOfResponse = await neynar.post({
          tokenAddress: params.tokenAddress,
          text: cast.cast.text,
          embeds,
          quote: quoteHash,
          parent: parentHash,
          channel: channelId,
          bestOfSigner: true,
        })

        if ('cast' in bestOfResponse) {
          await createPostMapping({
            castHash: params.hash,
            tweetId: bestOfTweetId,
            bestOfHash: bestOfResponse.cast.hash,
          })
          return {
            success: true,
            tweetId: bestOfTweetId,
            bestOfHash: bestOfResponse.cast.hash,
          }
        }

        return {
          success: false,
        }
      },
      {
        body: t.Object({
          proof: t.Array(t.Number()),
          publicInputs: t.Array(t.Array(t.Number())),
          args: t.Optional(
            t.Object({
              asReply: t.Optional(t.Boolean()),
            })
          ),
        }),
      }
    )
    .post(
      '/launch',
      async ({ body, submitHashBackend }) => {
        const isValid = await submitHashBackend.verifyFinalProof({
          proof: new Uint8Array(body.proof),
          publicInputs: body.publicInputs.map((i) => new Uint8Array(i)),
        })
        if (!isValid) {
          throw new Error('Invalid proof')
        }

        const params = extractSubmitHashData(body.publicInputs)

        await validateRoot(ProofType.LAUNCH_POST, params.tokenAddress, params.root)

        const cast = await neynar.getCast(params.hash)
        if (!cast.cast) {
          return {
            success: false,
          }
        }

        const mapping = await getPostMapping(params.hash)
        if (mapping?.launchHash) {
          return {
            success: true,
          }
        }

        const parentHash = cast.cast.parent_hash
        const channelId = cast.cast.channel?.id
        const embeds: string[] = []
        let quoteHash: string | undefined
        for (const embed of cast.cast.embeds || []) {
          if (embed.url) {
            embeds.push(embed.url)
          } else if (embed.cast) {
            quoteHash = embed.cast.hash
          }
        }

        const launchResponse = await neynar.post({
          tokenAddress: params.tokenAddress,
          text: cast.cast.text,
          embeds,
          quote: quoteHash,
          parent: parentHash,
          channel: channelId,
          launchSigner: true,
        })
        if (!launchResponse.success) {
          return {
            success: false,
          }
        }

        if ('cast' in launchResponse) {
          await createPostMapping({
            castHash: params.hash,
            launchHash: launchResponse.cast.hash,
          })
        }

        return launchResponse
      },
      {
        body: t.Object({
          proof: t.Array(t.Number()),
          publicInputs: t.Array(t.Array(t.Number())),
        }),
      }
    )
    .post(
      '/reveal',
      async ({ body }) => {
        const isValidSignature = await verifyMessage({
          message: body.message,
          signature: body.signature as `0x${string}`,
          address: body.address as `0x${string}`,
        })
        if (!isValidSignature) {
          return {
            success: false,
          }
        }
      },
      {
        body: t.Object({
          type: t.Enum(ProofType),
          proof: t.Array(t.Number()),
          publicInputs: t.Array(t.String()),
        }),
      }
    )
    .post(
      '/create',
      async ({ body, createPostBackend }) => {
        const isValid = await createPostBackend.verifyProof({
          proof: new Uint8Array(body.proof),
          publicInputs: body.publicInputs,
        })
        if (!isValid) {
          throw new Error('Invalid proof')
        }
        const params = extractCreatePostData(body.publicInputs)
        console.log(params)
        return

        await validateRoot(ProofType.CREATE_POST, params.tokenAddress, params.root)

        const result = await neynar.post(params)

        if (BigInt(params.revealHash) != BigInt(0) && 'cast' in result) {
          await createPostReveal(
            result.cast.hash.toLowerCase(),
            params.revealHash.toLowerCase()
          )
        }

        return result
      },
      {
        body: t.Object({
          proof: t.Array(t.Number()),
          publicInputs: t.Array(t.String()),
        }),
      }
    )
    .post(
      '/delete',
      async ({ body, submitHashBackend }) => {
        const isValid = await submitHashBackend.verifyProof({
          proof: new Uint8Array(body.proof),
          publicInputs: body.publicInputs,
        })
        if (!isValid) {
          throw new Error('Invalid proof')
        }

        const params = extractSubmitHashData(body.publicInputs)

        await validateRoot(ProofType.DELETE_POST, params.tokenAddress, params.root)

        const postMapping = await getPostMapping(params.hash)
        if (postMapping) {
          if (postMapping.tweetId) {
            await twitterClient.v2.deleteTweet(postMapping.tweetId)
          }
          if (postMapping.bestOfHash) {
            await neynar.delete({
              hash: postMapping.bestOfHash,
              tokenAddress: params.tokenAddress,
            })
          }
        }

        await deletePostMapping(params.hash)

        return {
          success: true,
        }
      },
      {
        body: t.Object({
          proof: t.Array(t.Number()),
          publicInputs: t.Array(t.String()),
        }),
      }
    )
    .post(
      '/promote',
      async ({ body, submitHashBackend }) => {
        const isValid = await submitHashBackend.verifyProof({
          proof: new Uint8Array(body.proof),
          publicInputs: body.publicInputs,
        })
        if (!isValid) {
          throw new Error('Invalid proof')
        }

        const params = extractSubmitHashData(body.publicInputs)

        await validateRoot(ProofType.PROMOTE_POST, params.tokenAddress, params.root)

        const cast = await neynar.getCast(params.hash)
        if (!cast.cast) {
          return {
            success: false,
          }
        }

        const mapping = await getPostMapping(params.hash)
        if (mapping?.tweetId) {
          return {
            success: true,
          }
        }

        const parentMapping = cast.cast.parent_hash
          ? await getPostMapping(cast.cast.parent_hash)
          : undefined

        const bestOfTweetId = await promoteToTwitter(
          cast.cast,
          parentMapping?.tweetId || undefined,
          body.args?.asReply
        )

        const bestOfResponse = await neynar.postAsQuote({
          tokenAddress: params.tokenAddress,
          quoteFid: cast.cast.author.fid,
          quoteHash: cast.cast.hash,
        })

        await createPostMapping(params.hash, bestOfTweetId, bestOfResponse.hash)

        return {
          success: true,
          tweetId: bestOfTweetId,
          bestOfHash: bestOfResponse.hash,
        }
      },
      {
        body: t.Object({
          proof: t.Array(t.Number()),
          publicInputs: t.Array(t.String()),
          args: t.Optional(
            t.Object({
              asReply: t.Boolean(),
            })
          ),
        }),
      }
    )
    .post(
      '/reveal',
      async ({ body }) => {
        const isValidSignature = await verifyMessage({
          message: body.message,
          signature: body.signature as `0x${string}`,
          address: body.address as `0x${string}`,
        })
        if (!isValidSignature) {
          return {
            success: false,
          }
        }

        const address = body.address.toLowerCase()
        const users = await neynar.getBulkUsers([address])

        await markPostReveal(
          body.castHash,
          body.revealPhrase,
          body.signature,
          body.address
        )

        const username = users?.[address]?.[0]?.username

        await neynar.post({
          text: `REVEALED: Posted by ${username ? `@${username}` : `${address}`}`,
          embeds: [`https://anoncast.org/posts/${body.castHash}`],
          quote: body.castHash,
          tokenAddress: body.tokenAddress,
        })

        return {
          success: true,
        }
      },
      {
        body: t.Object({
          castHash: t.String(),
          message: t.String(),
          revealPhrase: t.String(),
          signature: t.String(),
          address: t.String(),
          tokenAddress: t.String(),
        }),
      }
    )
    .get(
      '/:hash',
      async ({ params, error }) => {
        const cast = await neynar.getCast(params.hash)
        if (!cast?.cast) {
          return error(404, 'Cast not found')
        }

        const revealedCast = await augmentCasts([cast.cast])
        return revealedCast[0]
      },
      {
        params: t.Object({
          hash: t.String(),
        }),
      }
    )
}

function extractCreatePostData(data: string[]): CreatePostParams {
  const root = data[0]

  const tokenAddress = `0x${data[1].slice(-40)}`

  const timestamp = parseInt(data[2], 16)

  const textArrays = data.slice(3, 3 + 16)
  const textBytes = textArrays.map((hexString) => Buffer.from(hexString.slice(2), 'hex'))
  const text = Buffer.concat(textBytes).toString('utf-8').replace(/\0/g, '')

  const embed1Array = data.slice(3 + 16, 3 + 32)
  const embed1Bytes = embed1Array.map((hexString) =>
    Buffer.from(hexString.slice(2), 'hex')
  )
  const embed1 = Buffer.concat(embed1Bytes).toString('utf-8').replace(/\0/g, '')

  const embed2Array = data.slice(3 + 32, 3 + 48)
  const embed2Bytes = embed2Array.map((hexString) =>
    Buffer.from(hexString.slice(2), 'hex')
  )
  const embed2 = Buffer.concat(embed2Bytes).toString('utf-8').replace(/\0/g, '')

  const quote = `0x${data[3 + 48].slice(-40)}`

  const channel = Buffer.from(data[3 + 48 + 1].slice(2), 'hex')
    .toString('utf-8')
    .replace(/\0/g, '')

  const parent = `0x${data[3 + 48 + 2].slice(-40)}`

  const revealHashArray = data.slice(3 + 48 + 3, 3 + 48 + 3 + 2)
  const revealHashHexes = revealHashArray.map((b) => b.slice(-32))
  const revealHash = `0x${revealHashHexes.join('')}`

  return {
    timestamp,
    root: root as string,
    text,
    embeds: [embed1, embed2].filter((e) => e !== ''),
    quote: quote === zeroAddress ? '' : quote,
    channel,
    parent: parent === zeroAddress ? '' : parent,
    tokenAddress: tokenAddress as string,
    revealHash,
  }
}

function extractSubmitHashData(data: string[]): SubmitHashParams {
  const root = data[0]

  const tokenAddress = `0x${data[1].slice(-40)}`

  const timestamp = parseInt(data[2], 16)

  const hash = `0x${data[3].slice(-40)}`

  return {
    timestamp,
    root: root as string,
    hash,
    tokenAddress: tokenAddress as string,
  }
}

async function validateRoot(type: ProofType, tokenAddress: string, root: string) {
  const validRoots = await getValidRoots(tokenAddress, type)
  if (!validRoots.length) {
    throw new Error('No valid roots found')
  }

  if (!validRoots.includes(root)) {
    throw new Error('Invalid root')
  }
}
