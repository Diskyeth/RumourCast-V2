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
        const response = await fetch('https://rumournews-rumournews.up.railway.app/casts', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        console.log('Fetched casts:', data) // Debugging log
        if (Array.isArray(data.casts)) {
          setCasts(data.casts)
        } else {
          console.error('Invalid response format:', data)
        }
      } catch (error) {
        console.error('Error fetching casts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCasts()

    const eventSource = new EventSource('https://rumournews-rumournews.up.railway.app/sse') // Ensure this is an SSE endpoint
    eventSource.onmessage = (event) => {
      try {
        const newCast = JSON.parse(event.data)
        console.log('New cast received:', newCast) // Debugging log
        setCasts((prevCasts) => [newCast, ...prevCasts])
      } catch (error) {
        console.error('Error parsing SSE data:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE error:', error)
      eventSource.close()
    }

    return () => eventSource.close()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Latest Farcaster Casts</h1>
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <div className="flex flex-col gap-4 rounded-xl">
          {casts.length === 0 ? (
            <p className="text-gray-500">No casts available.</p>
          ) : (
            casts.map((cast) => (
              <Link href={`/posts/${cast.hash}`} key={cast.hash}>
                <div className="p-4 border rounded bg-gray-900 text-white hover:bg-gray-800 cursor-pointer">
                  <p className="font-semibold">{cast.username}</p>
                  <p>{cast.text}</p>
                  <span className="text-sm text-gray-400">{new Date(cast.timestamp).toLocaleString()}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
