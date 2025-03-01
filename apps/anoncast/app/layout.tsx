import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { GeistSans } from 'geist/font/sans'
import { ConnectButton } from '@/components/connect-button'
import { Logo } from '@/components/logo'
import BackToTopButton from '@/components/ui/back-to-top-button'
import HamburgerMenuButton from '@/components/ui/hamburger-menu-button'

export const metadata: Metadata = {
  title: 'RumourCast',
  description: 'Spread rumours on Farcaster.',
  openGraph: {
    title: 'RumourCast',
    description: 'Spread rumours on Farcaster.',
    images: ['/rumour.png'],
  },
  other: {
    ['fc:frame']: JSON.stringify({
      version: 'next',
      imageUrl: 'https://rumourcast.fun/banner.png',
      button: {
        title: 'Spread Rumours',
        action: {
          type: 'launch_frame',
          name: 'RumourCast',
          url: 'https://frame.rumourcast.fun/',
          splashImageUrl: 'https://rumourcast.fun/rumour.png',
          splashBackgroundColor: '#201424',
        },
      },
    }),
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${GeistSans.className} antialiased min-h-screen w-full bg-background`}>
        
        {/* Header remains outside Providers */}
        <header className="sticky top-0 z-50 backdrop-blur-md w-full px-6 xl:px-12 py-4">
          <div className="flex justify-between items-center w-full">
            <Logo />
            <div className="flex items-center gap-6">
              <ConnectButton />
            </div>
          </div>
        </header>

        {/* Wrap only main content inside Providers */}
        <Providers>
          <main className="flex-1 w-full">{children}</main>
        </Providers>

        {/* Place HamburgerMenuButton here so it's not inside Providers */}
        <HamburgerMenuButton />

        <Toaster />
        <BackToTopButton />
      </body>
    </html>
  )
}