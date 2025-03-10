// app/news/layout.tsx
import type { ReactNode } from 'react'

export default function NewsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-screen-sm mx-auto px-4">
    {children}
  </div>
  );
}
