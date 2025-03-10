// app/news/layout.tsx
import type { ReactNode } from 'react'
import BackToTopButton from '@/components/ui/back-to-top-button'

export default function NewsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col max-w-screen-sm mx-auto gap-8">
    {children}
  </div>
  );
}
<BackToTopButton />