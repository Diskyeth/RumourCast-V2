'use client'

import { CreatePostProvider } from '@/components/create-post/context'
import { BreakingNewsSection } from '@/components/BreakingNewsSection'
import { FarcasterCastsSection } from '@/components/FarcasterCastsSection'



export default function Home() {
  return (

    <CreatePostProvider initialVariant="news">
      <div className="p-8 w-full max-w-screen-xl mx-auto flex flex-col relative">

        
        <BreakingNewsSection />
        <div className="mt-auto w-auto flex flex-col"> {/* Ensure FarcasterCastsSection uses full width */}
          <FarcasterCastsSection />
        </div>
      </div>
    </CreatePostProvider>

  )
}
