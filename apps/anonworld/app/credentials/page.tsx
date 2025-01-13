'use client'

import {
  CredentialDisplay,
  CredentialWithId,
  formatHexId,
  NewCredential,
  NewVault,
  useCredentials,
  Vault,
  VaultAvatar,
  VaultSettings,
} from '@anonworld/react'
import { Dialog, Separator, Text, View, XStack, YStack } from '@anonworld/ui'
import { Content } from '@/components/content'
import { Plus, Settings } from '@tamagui/lucide-icons'

export default function Credentials() {
  const { vaults, localCredentials } = useCredentials()

  return (
    <Content>
      <XStack ai="center" jc="space-between" $xs={{ px: '$2' }}>
        <View />
        <XStack gap="$2" ai="center">
          <NewVault />
          <NewCredential />
        </XStack>
      </XStack>
      <YStack gap="$4">
        {Object.values(vaults).map((vault, i) => (
          <VaultDisplay key={vault.id} vault={vault} credentials={vault.credentials} />
        ))}
        <VaultDisplay credentials={localCredentials} />
      </YStack>
    </Content>
  )
}

function VaultDisplay({
  vault,
  credentials,
}: {
  vault?: Vault
  credentials: CredentialWithId[]
}) {
  return (
    <YStack
      theme="surface1"
      themeShallow
      bg="$background"
      bc="$borderColor"
      bw="$0.5"
      p="$3"
      gap="$3"
      br="$4"
      $xs={{
        br: '$0',
        bw: '$0',
        btw: '$0.5',
        bbw: '$0.5',
        px: '$2',
        py: '$3',
      }}
      fs={1}
    >
      <XStack ai="center" jc="space-between">
        <XStack ai="center" gap="$2">
          <VaultAvatar vaultId={vault?.id} imageUrl={vault?.image_url} size="$2" />
          <Text fos="$3" fow="600">
            {vault ? vault.username || formatHexId(vault.id) : 'Anonymous'}
          </Text>
        </XStack>
        {vault ? (
          <VaultSettings vault={vault}>
            <Dialog.Trigger>
              <XStack p="$2" br="$12" hoverStyle={{ bg: '$color5' }} cursor="pointer">
                <Settings size={16} />
              </XStack>
            </Dialog.Trigger>
          </VaultSettings>
        ) : (
          <NewCredential>
            <Dialog.Trigger>
              <XStack p="$2" br="$12" hoverStyle={{ bg: '$color5' }} cursor="pointer">
                <Plus size={16} />
              </XStack>
            </Dialog.Trigger>
          </NewCredential>
        )}
      </XStack>
      {credentials.length > 0 ? (
        <YStack>
          {credentials
            .sort(
              (a, b) =>
                new Date(b.verified_at).getTime() - new Date(a.verified_at).getTime()
            )
            .map((credential, i) => (
              <>
                <Separator
                  key={`${credential.id}-separator`}
                  mb="$2.5"
                  mt={i === 0 ? '$0' : '$2.5'}
                />
                <View key={`${credential.id}-view`} p="$2">
                  <CredentialDisplay credential={credential} />
                </View>
              </>
            ))}
        </YStack>
      ) : (
        <>
          <Separator />
          <View p="$2" ai="center" jc="center">
            <NewCredential vault={vault} />
          </View>
        </>
      )}
    </YStack>
  )
}
