// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { GeistSans } from 'geist/font/sans'
import { ConnectButton } from '@/components/connect-button'
import { Logo } from '@/components/logo'
import BackToTopButton from '@/components/ui/back-to-top-button'
import HamburgerMenuButton from '@/components/ui/hamburger-menu-button'
import { Tabs } from '@/components/Tabs'

export const metadata: Metadata = {
  title: 'RumourCast',
  description: 'Spread rumours on Farcaster.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${GeistSans.className}`}>
        <Providers>
          <header className="sticky top-0 z-50 backdrop-blur-md w-full px-4 xl:px-8 py-4">
            <div className="flex items-center justify-between">
              <Logo />
              <div className="flex items-center gap-8">

                <ConnectButton />
                <HamburgerMenuButton />
              </div>
            </div>
          </header>

          {children}

          <Tabs />
          <BackToTopButton />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
