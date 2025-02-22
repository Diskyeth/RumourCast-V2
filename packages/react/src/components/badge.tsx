import { View, Text } from '@anonworld/ui'

export function Badge({
  children,
  icon,
  onPress,
  destructive = false,
  highlight = false,
}: {
  children?: React.ReactNode
  icon?: React.ReactNode
  onPress?: () => void
  destructive?: boolean
  highlight?: boolean
}) {
  return (
    <View
      theme="surface3"
      bg={destructive ? '$red3' : highlight ? '$green3' : '$background'}
      bc={destructive ? '$red9' : highlight ? '$green9' : '$borderColor'}
      bw="$0.25"
      br="$12"
      px={children ? '$2' : '$1.5'}
      py="$1.5"
      fd="row"
      ai="center"
      gap="$1.5"
      onPress={onPress}
      cursor="pointer"
      hoverStyle={{ bg: '$color5' }}
    >
      {icon}
      {children && (
        <Text
          fos="$1"
          color={destructive ? '$red12' : highlight ? '$green12' : undefined}
        >
          {children}
        </Text>
      )}
    </View>
  )
}
