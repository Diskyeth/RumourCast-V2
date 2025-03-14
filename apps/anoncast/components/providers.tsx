'use client'

import '@rainbow-me/rainbowkit/styles.css'

import {
  getDefaultConfig,
  RainbowKitProvider,
  useConnectModal,
} from '@rainbow-me/rainbowkit'
import { ThemeProvider } from 'next-themes'
import { Provider, SDKProvider, viemConfig } from '@anonworld/react'
import { ReactNode } from 'react'

const config = getDefaultConfig({
  ...viemConfig,
  appName: 'RumourCast',
  projectId: '450c27e475631614e75d3e992ea6cd69',
  ssr: true,
})


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      forcedTheme="dark"
      disableTransitionOnChange
    >
      <Provider wagmiConfig={config}>
        <RainbowKitProvider>
          <SDKInner>{children}</SDKInner>
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
