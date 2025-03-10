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
import { Tabs } from '@/components/tabs'

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <html lang="en">
      <body className={`${GeistSans.className}`}>
      <Providers>
        <header className="sticky top-0 z-50 backdrop-blur-md w-full px-4 xl:px-8 py-4">
  <div className="flex items-center justify-between relative">
    <Logo />
    <div className="flex gap-8 items-center">
      <ConnectButton />
      <HamburgerMenuButton />
    </div>

  </div>
</header>

        {children}

        <BackToTopButton />
        <Tabs />
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
