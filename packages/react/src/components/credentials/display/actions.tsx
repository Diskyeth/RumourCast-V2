import { FileText, Minus, MoreHorizontal, Plus, Trash } from '@tamagui/lucide-icons'
import { Popover, Text, View, YGroup } from '@anonworld/ui'
import { NamedExoticComponent, useState } from 'react'
import { Credential } from '../../../types'
import { useSDK } from '../../../providers'
import { CredentialProof } from './proof'
import { useVaults } from '../../../hooks/use-vaults'

export function CredentialActions({ credential }: { credential: Credential }) {
  const [viewProof, setViewProof] = useState(false)
  const { credentials, auth } = useSDK()
  const { data: vaults } = useVaults(auth.passkeyId)

  return (
    <>
      <Popover size="$5" placement="bottom">
        <Popover.Trigger
          onPress={(e) => {
            e.stopPropagation()
          }}
        >
          <View p="$2" br="$12" hoverStyle={{ bg: '$color5' }} cursor="pointer">
            <MoreHorizontal size={20} />
          </View>
        </Popover.Trigger>
        <Popover.Content
          enterStyle={{ y: -10, opacity: 0 }}
          exitStyle={{ y: -10, opacity: 0 }}
          elevate
          animation={[
            '100ms',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          padding="$0"
          cursor="pointer"
          bordered
          overflow="hidden"
        >
          <YGroup>
            <ActionButton
              label="View proof"
              onPress={() => setViewProof(true)}
              Icon={FileText}
            />
            {!credential.vault && (
              <ActionButton
                label="Add to profile"
                onPress={async () => {
                  if (!vaults || vaults.length === 0) return
                  await credentials.addToVault(vaults[0].id, credential.id)
                }}
                Icon={Plus}
              />
            )}
            {credential.vault && (
              <ActionButton
                label="Remove from profile"
                onPress={async () => {
                  if (!credential.vault) return
                  await credentials.removeFromVault(credential.vault.id, credential.id)
                }}
                Icon={Minus}
              />
            )}
            <ActionButton
              label="Delete"
              onPress={() => credentials.delete(credential.id)}
              Icon={Trash}
              destructive
            />
          </YGroup>
        </Popover.Content>
      </Popover>
      <CredentialProof
        open={viewProof}
        onOpenChange={setViewProof}
        credential={credential}
      />
    </>
  )
}

function ActionButton({
  label,
  onPress,
  Icon,
  destructive = false,
}: {
  label: string
  onPress: () => void
  Icon?: NamedExoticComponent<any>
  destructive?: boolean
}) {
  return (
    <YGroup.Item>
      <View
        onPress={onPress}
        fd="row"
        ai="center"
        gap="$2"
        px="$3.5"
        py="$2.5"
        hoverStyle={{ bg: '$color5' }}
      >
        {Icon && <Icon size={16} color={destructive ? '$red9' : undefined} />}
        <Text fos="$2" fow="400" color={destructive ? '$red9' : undefined}>
          {label}
        </Text>
      </View>
    </YGroup.Item>
  )
}
