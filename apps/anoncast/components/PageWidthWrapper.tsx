'use client'

import { usePathname } from 'next/navigation'

export default function PageWidthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isNewsPage = pathname.includes('/news')

  return (
    <div className={`${isNewsPage ? 'max-w-full' : 'max-w-screen-md'} mx-auto px-4`}>
      {children}
    </div>
  )
}
