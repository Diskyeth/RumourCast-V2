'use client'

import { useEffect, useState } from 'react'
import { CreatePostProvider } from '@/components/create-post/context'
import { Button } from '@/components/ui/button'
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
        const response = await fetch('https://rumourreporter-rumourreporter-agent.up.railway.app/casts') // API to fetch recent casts
        const data = await response.json()
        setCasts(data.casts)
      } catch (error) {
        console.error('Error fetching casts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCasts()

    const eventSource = new EventSource('https://rumourreporter-rumourreporter-agent.up.railway.app/webhook') // Webhook for real-time updates
    eventSource.onmessage = (event) => {
      const newCast = JSON.parse(event.data)
      setCasts((prevCasts) => [newCast, ...prevCasts])
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
          {casts.map((cast) => (
            <Link href={`/posts/${cast.hash}`} key={cast.hash}>
              <div className="p-4 border rounded bg-gray-900 text-white hover:bg-gray-800 cursor-pointer">
                <p className="font-semibold">{cast.username}</p>
                <p>{cast.text}</p>
                <span className="text-sm text-gray-400">{new Date(cast.timestamp).toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
