import { memo } from 'react'
import type { IconProps } from '@tamagui/helpers-icon'
import { Svg, Path, Circle, Rect } from 'react-native-svg'
import { themed } from '@tamagui/helpers-icon'

const Icon = (props) => {
  const { color = 'black', size = 24, ...otherProps } = props
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 1000 1000"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...otherProps}
    >
      <Circle cx="500" cy="500" r="383" stroke={color} strokeWidth="22" />
      <Path
        d="M200.122 743.945C285.833 724.624 390.746 714.072 498.899 714C607.051 713.929 712.125 724.343 798.13 743.553"
        stroke={color}
        strokeWidth="22"
      />
      <Path
        d="M799.878 256.055C714.167 275.376 609.254 285.928 501.101 286C392.949 286.071 287.875 275.657 201.87 256.447"
        stroke={color}
        strokeWidth="22"
      />
      <Path
        d="M757 500C757 606.886 727.512 703.166 680.409 772.413C633.268 841.719 569.287 883 500 883C430.713 883 366.732 841.719 319.591 772.413C272.488 703.166 243 606.886 243 500C243 393.114 272.488 296.834 319.591 227.587C366.732 158.281 430.713 117 500 117C569.287 117 633.268 158.281 680.409 227.587C727.512 296.834 757 393.114 757 500Z"
        stroke={color}
        strokeWidth="22"
      />
      <Path
        d="M597 500C597 608.108 584.976 705.584 565.759 775.692C556.128 810.825 544.858 838.46 532.807 857.055C520.445 876.13 509.113 883 500 883C490.887 883 479.554 876.13 467.192 857.055C455.142 838.46 443.871 810.825 434.241 775.692C415.023 705.584 403 608.108 403 500C403 391.892 415.023 294.416 434.241 224.308C443.871 189.175 455.142 161.54 467.192 142.945C479.554 123.87 490.887 117 500 117C509.113 117 520.445 123.87 532.807 142.945C544.858 161.54 556.128 189.175 565.759 224.308C584.976 294.416 597 391.892 597 500Z"
        stroke={color}
        strokeWidth="22"
      />
      <Rect x="123" y="489" width="758" height="22" fill={color} />
    </Svg>
  )
}

Icon.displayName = 'AnonWorld'

export const AnonWorld = memo<IconProps>(themed(Icon))
