'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export function FarcasterCastsSection() {
  const [casts, setCasts] = useState([])
  const [loading, setLoading] = useState(true)
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''

  useEffect(() => {
    async function fetchCasts() {
      try {
        const response = await fetch('https://news.rumourcast.fun/api/casts', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        const data = await response.json()
        setCasts(data.casts || [])
      } catch (error) {
        console.error('Error fetching casts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCasts()
  }, [])

  return (
    <div className={`w-full mb-12 'relative' : ''}`}> {/* Ignore layout settings for /news */}
      <h1 className="text-3xl font-bold mb-6 text-center">Latest Farcaster Casts</h1>
      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="animate-spin w-8 h-8 text-white" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-min">
          {casts.length <= 2 ? (
            <p className="text-gray-500 text-center">No casts available.</p>
          ) : (
            casts.slice(2).map((cast) => {
              const [firstParagraph, ...remainingText] = cast.text.split('\n')
              return (
                <Link href={`/posts/${cast.hash}`} key={cast.hash}>
                  <div className="p-6 border border-purple-500 rounded-xl bg-gray-900 text-white hover:bg-gray-800 cursor-pointer shadow-lg overflow-hidden break-words max-w-full">
                    <p className="font-bold text-lg break-words">{firstParagraph}</p>
                    <hr className="border-gray-600 my-2" />
                    {remainingText.length > 0 && (
                      <p className="text-base mt-2 break-words">{remainingText.join('\n')}</p>
                    )}
                    <span className="text-sm text-gray-400 block mt-2">
                      {new Date(cast.timestamp).toLocaleString()}
                    </span>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}