import {
  Action,
  Credential,
  ERC20CredentialRequirement,
  CredentialType,
  CredentialRequirement,
  ERC721CredentialRequirement,
  FarcasterFidCredentialRequirement,
  NativeCredentialRequirement,
} from '@anonworld/common'
import { ERC20BalanceDisplay } from './erc20-balance/display'
import { ERC20BalanceRequirement } from './erc20-balance/requirement'
import { ERC20BalanceBadge } from './erc20-balance/badge'
import { ERC20BalanceSelect } from './erc20-balance/select'
import { ERC721BalanceDisplay } from './erc721-balance/display'
import { ERC721BalanceRequirement } from './erc721-balance/requirement'
import { ERC721BalanceBadge } from './erc721-balance/badge'
import { ERC721BalanceSelect } from './erc721-balance/select'
import { FarcasterFidDisplay } from './farcaster-fid/display'
import { FarcasterFidRequirement } from './farcaster-fid/requirement'
import { FarcasterFidBadge } from './farcaster-fid/badge'
import { FarcasterFidSelect } from './farcaster-fid/select'
import { NativeBalanceDisplay } from './native-balance/display'
import { NativeBalanceRequirement } from './native-balance/requirement'
import { NativeBalanceBadge } from './native-balance/badge'
import { NativeBalanceSelect } from './native-balance/select'

export function CredentialTypeDisplay({ credential }: { credential: Credential }) {
  switch (credential.type) {
    case CredentialType.ERC20_BALANCE:
      return <ERC20BalanceDisplay credential={credential} />
    case CredentialType.ERC721_BALANCE:
      return <ERC721BalanceDisplay credential={credential} />
    case CredentialType.FARCASTER_FID:
      return <FarcasterFidDisplay credential={credential} />
    case CredentialType.NATIVE_BALANCE:
      return <NativeBalanceDisplay credential={credential} />
    default:
      return null
  }
}

export function CredentialTypeRequirement({
  action,
  req,
}: {
  action: Action
  req: CredentialRequirement
}) {
  const type = action.credential_id?.split(':')[0]
  switch (type) {
    case CredentialType.ERC20_BALANCE:
      return (
        <ERC20BalanceRequirement
          action={action}
          req={req as ERC20CredentialRequirement}
        />
      )
    case CredentialType.ERC721_BALANCE:
      return (
        <ERC721BalanceRequirement
          action={action}
          req={req as ERC721CredentialRequirement}
        />
      )
    case CredentialType.FARCASTER_FID:
      return (
        <FarcasterFidRequirement
          action={action}
          req={req as FarcasterFidCredentialRequirement}
        />
      )
    case CredentialType.NATIVE_BALANCE:
      return (
        <NativeBalanceRequirement
          action={action}
          req={req as NativeCredentialRequirement}
        />
      )
    default:
      return null
  }
}

export function CredentialTypeBadge({ credential }: { credential: Credential }) {
  switch (credential.type) {
    case CredentialType.ERC20_BALANCE:
      return <ERC20BalanceBadge credential={credential} />
    case CredentialType.ERC721_BALANCE:
      return <ERC721BalanceBadge credential={credential} />
    case CredentialType.FARCASTER_FID:
      return <FarcasterFidBadge credential={credential} />
    case CredentialType.NATIVE_BALANCE:
      return <NativeBalanceBadge credential={credential} />
    default:
      return null
  }
}

export function CredentialTypeSelect({ credential }: { credential: Credential }) {
  switch (credential.type) {
    case CredentialType.ERC20_BALANCE:
      return <ERC20BalanceSelect credential={credential} />
    case CredentialType.ERC721_BALANCE:
      return <ERC721BalanceSelect credential={credential} />
    case CredentialType.FARCASTER_FID:
      return <FarcasterFidSelect credential={credential} />
    case CredentialType.NATIVE_BALANCE:
      return <NativeBalanceSelect credential={credential} />
    default:
      return null
  }
}
