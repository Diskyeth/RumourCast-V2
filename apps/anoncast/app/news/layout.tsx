// app/news/layout.tsx
import type { ReactNode } from 'react'

export default function NewsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-screen mx-auto px-4 p-8 xl:px-8">
    {children}
  </div>
  );
}
