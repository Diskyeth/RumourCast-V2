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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${GeistSans.className} antialiased min-h-screen w-full overflow-x-hidden`}
      >
        {/* Hamburger Menu Button (Fixed Top Right) */}
        <div className="fixed top-4 right-6 xl:right-12 z-40">
          <HamburgerMenuButton />
        </div>

        {/* Main Content (Inside Providers) */}
        <Providers>
          <div className="flex h-screen flex-col p-4 xl:p-8 max-w-screen-sm mx-auto gap-8">
            {/* Header Section */}
            <div className="flex items-center justify-between xl:absolute xl:top-0 xl:left-0 xl:right-0 xl:p-8 xl:max-w-screen-xl xl:mx-auto">
              <Logo />
              {/* Connect Button (Now Positioned Properly) */}
              <div className="relative flex items-center">
                <ConnectButton />
              </div>
            </div>

            {/* Page Content */}
            <div className="z-10">{children}</div>
          </div>
        </Providers>

        <Toaster />
        <BackToTopButton />
      </body>
    </html>
  );
}
