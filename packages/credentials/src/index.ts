import { CredentialType } from '@anonworld/common'
import { Verifier } from './verifiers/verifier'
import { TokenBalanceVerifier } from './verifiers/token-balance'
import { FarcasterFidVerifier } from './verifiers/farcaster-fid'
import { NativeBalanceVerifier } from './verifiers/native-balance'
export type { Circuit } from './utils/circuit'
export * from './types'

type VerifierConstructor = new (type: CredentialType, version: string) => Verifier

const Verifiers: Record<CredentialType, VerifierConstructor> = {
  [CredentialType.ERC20_BALANCE]: TokenBalanceVerifier,
  [CredentialType.ERC721_BALANCE]: TokenBalanceVerifier,
  [CredentialType.FARCASTER_FID]: FarcasterFidVerifier,
  [CredentialType.NATIVE_BALANCE]: NativeBalanceVerifier,
}

export class CredentialsManager {
  private verifiers: Record<string, Record<string, Verifier>> = {}

  constructor() {
    // puck erc20 and erc721 verifiers so they can cache imports in the background
    this.getVerifier(CredentialType.ERC20_BALANCE)
    this.getVerifier(CredentialType.ERC721_BALANCE)
  }

  getVerifier<T extends CredentialType>(circuitType: T, circuitVersion = 'latest') {
    if (!this.verifiers[circuitType]) {
      this.verifiers[circuitType] = {}
    }

    if (this.verifiers[circuitType][circuitVersion]) {
      return this.verifiers[circuitType][circuitVersion]
    }

    const VerifierClass = Verifiers[circuitType]
    if (!VerifierClass) {
      throw new Error('Invalid circuit type')
    }

    this.verifiers[circuitType][circuitVersion] = new VerifierClass(
      circuitType,
      circuitVersion
    )

    return this.verifiers[circuitType][circuitVersion]
  }
}
