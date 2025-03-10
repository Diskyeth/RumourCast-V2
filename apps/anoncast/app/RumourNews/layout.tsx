// app/news/layout.tsx
import type { ReactNode } from 'react'

export default function NewsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col max-w-screen">
    {children}
  </div>
  );
}
