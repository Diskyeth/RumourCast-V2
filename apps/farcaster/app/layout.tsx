import type { Metadata } from 'next'
import './globals.css'
import { GeistSans } from 'geist/font/sans'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'RumourCast',
  description: 'Spread rumours on Farcaster.',
  openGraph: {
    title: 'RumourCast',
    description: 'Spread rumours on Farcaster.',
    images: ['/rumour.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} antialiased min-h-screen w-full bg-background`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
