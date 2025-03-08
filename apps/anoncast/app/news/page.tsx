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
          setCasts((prevCasts) => [newCast, ...prevCasts])
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Latest Farcaster Casts</h1>
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {casts.length === 0 ? (
            <p className="text-gray-500">No casts available.</p>
          ) : (
            casts.map((cast) => (
              <Link href={`/posts/${cast.hash}`} key={cast.hash}>
                <div className="p-4 border rounded-xl text-white hover:bg-gray-800 cursor-pointer shadow-lg">
                  <p>{cast.text}</p>
                  <span className="text-sm text-gray-400">
                    {new Date(cast.timestamp).toLocaleString()}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
