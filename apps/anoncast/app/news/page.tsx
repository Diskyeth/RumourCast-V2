'use client'

import { useEffect, useState } from 'react'
import { CreatePostProvider } from '@/components/create-post/context'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <CreatePostProvider initialVariant="news">
      <Inner />
    </CreatePostProvider>
  )
}

function Inner() {
  const [casts, setCasts] = useState([])
  const [loading, setLoading] = useState(true)

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
        console.log('Fetched casts:', data) // Debugging
        setCasts(data.casts || [])
      } catch (error) {
        console.error('Error fetching casts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCasts()

    let eventSource
    try {
      eventSource = new EventSource('https://news.rumourcast.fun/api/casts')
      eventSource.onmessage = (event) => {
        try {
          const newCast = JSON.parse(event.data)
          console.log('New cast received:', newCast) // Debugging
          setCasts((prevCasts) => [newCast, ...prevCasts]) // Ensures newest casts go first
        } catch (error) {
          console.error('Error parsing SSE data:', error)
        }
      }
      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        eventSource.close()
      }
    } catch (error) {
      console.error('Failed to connect to SSE:', error)
    }

    const interval = setInterval(fetchCasts, 10000)

    return () => {
      if (eventSource) eventSource.close()
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Latest Farcaster Casts</h1>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="animate-spin w-8 h-8 text-white" />
        </div>
      ) : (
        // 🚀 Maintain full-width div, enforce grid for equal spacing
        <div className="absolute left-0 right-0 w-full px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-auto">
            {casts.length === 0 ? (
              <p className="text-gray-500 text-center">No casts available.</p>
            ) : (
              casts.map((cast) => {
                // Split text into first paragraph and the rest
                const [firstParagraph, ...remainingText] = cast.text.split('\n')

                return (
                  <Link href={`/posts/${cast.hash}`} key={cast.hash}>
                    <div className="p-6 border border-purple-500 rounded-xl bg-gray-900 text-white hover:bg-gray-800 cursor-pointer shadow-lg">
                      {/* First Paragraph: Bold and Larger */}
                      <p className="font-bold text-lg">{firstParagraph}</p>
                      {/* Remaining text: Normal */}
                      {remainingText.length > 0 && (
                        <p className="text-base mt-2">{remainingText.join('\n')}</p>
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
        </div>
      )}
    </div>
  )
}
