import { Action, ERC721CredentialRequirement } from '@anonworld/common'
import { Text } from '@anonworld/ui'
import { formatAmount } from '@anonworld/common'
import { formatUnits } from 'viem/utils'

export function ERC721BalanceRequirement({
  action,
  req,
}: {
  action: Action
  req: ERC721CredentialRequirement
}) {
  const symbol = action.community?.token.symbol
  const amount = Number.parseFloat(
    formatUnits(BigInt(req.minimumBalance), action.community?.token.decimals ?? 18)
  )

  return (
    <Text fos="$1" fow="500" color="$color10">
      {`req: ${formatAmount(amount)} ${symbol}`}
    </Text>
  )
}
