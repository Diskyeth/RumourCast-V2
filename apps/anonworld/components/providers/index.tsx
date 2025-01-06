'use client'

import { Provider, SDKProvider, viemConfig } from '@anonworld/react'
import {
  getDefaultConfig,
  RainbowKitProvider,
  useConnectModal,
} from '@rainbow-me/rainbowkit'
import { ReactNode, useEffect } from 'react'
import { ThemeProvider } from './theme'
import '@rainbow-me/rainbowkit/styles.css'
import sdk from '@farcaster/frame-sdk'
import { FramesProvider } from './frames'
const config = getDefaultConfig({
  ...viemConfig,
  appName: 'anoncast',
  projectId: '302e299e8d6c292b6aeb9f313321e134',
  ssr: true,
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <Provider wagmiConfig={config}>
        <RainbowKitProvider>
          <SDKInner>
            <FramesProvider>{children}</FramesProvider>
          </SDKInner>
        </RainbowKitProvider>
      </Provider>
    </ThemeProvider>
  )
}

function SDKInner({ children }: { children: ReactNode }) {
  const { connectModalOpen, openConnectModal } = useConnectModal()
  return (
    <SDKProvider
      apiUrl={process.env.NEXT_PUBLIC_API_URL}
      connectWallet={openConnectModal}
      isConnecting={connectModalOpen}
    >
      {children}
    </SDKProvider>
  )
}
