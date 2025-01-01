import type { ERC20Balance } from '@anonworld/zk'
import { formatArray, formatHexArray } from './utils'
import { Api } from './api'
import { getPublicKey } from './utils'
import { GetProofReturnType } from 'viem'

export type VerifyERC20Balance = {
  address: `0x${string}`
  signature: `0x${string}`
  messageHash: `0x${string}`
  storageHash: `0x${string}`
  storageProof: GetProofReturnType['storageProof']
  chainId: number
  blockNumber: bigint
  tokenAddress: `0x${string}`
  balanceSlot: `0x${string}`
  verifiedBalance: bigint
  blockTimestamp: bigint
  parentId?: string
}

export class AnonWorldSDK extends Api {
  private erc20Balance!: ERC20Balance

  constructor(apiUrl?: string) {
    super(apiUrl || 'https://api.anon.world')
  }

  async instantiate() {
    if (this.erc20Balance) return
    const { getCircuit, CircuitType } = await import('@anonworld/zk')
    this.erc20Balance = getCircuit(CircuitType.ERC20_BALANCE)
  }

  async verifyERC20Balance(args: VerifyERC20Balance) {
    await this.instantiate()

    const { pubKeyX, pubKeyY } = await getPublicKey(args.signature, args.messageHash)

    const storageProof = args.storageProof[0]
    const nodes = storageProof.proof.slice(0, storageProof.proof.length - 1)
    const leaf = storageProof.proof[storageProof.proof.length - 1]

    const input = {
      signature: formatHexArray(args.signature, { length: 64 }),
      message_hash: formatHexArray(args.messageHash),
      pub_key_x: formatHexArray(pubKeyX),
      pub_key_y: formatHexArray(pubKeyY),
      storage_hash: formatHexArray(args.storageHash),
      storage_nodes: formatArray(nodes, (node) =>
        formatHexArray(node, { length: 532, pad: 'right' })
      ),
      storage_leaf: formatHexArray(leaf, { length: 69, pad: 'right' }),
      storage_depth: storageProof.proof.length,
      storage_value: `0x${storageProof.value.toString(16)}`,
      chain_id: `0x${Number(args.chainId).toString(16)}`,
      block_number: `0x${args.blockNumber.toString(16)}`,
      token_address: args.tokenAddress,
      balance_slot: `0x${BigInt(args.balanceSlot).toString(16)}`,
      verified_balance: `0x${BigInt(args.verifiedBalance).toString(16)}`,
    }

    const proof = await this.erc20Balance.generate(input)

    return await this.createCredential({
      type: this.erc20Balance.type,
      version: this.erc20Balance.version,
      proof: Array.from(proof.proof),
      publicInputs: proof.publicInputs,
      parentId: args.parentId,
    })
  }
}
