'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

export function BreakingNewsSection() {
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

        // Remove duplicates with a 20-second window
        const uniqueCasts = []
        const seenTimestamps = []

        for (const cast of data.casts || []) {
          const castTime = new Date(cast.timestamp).getTime()

          // Check if any existing timestamp is within 20 seconds
          if (!seenTimestamps.some((time) => Math.abs(time - castTime) <= 20000)) {
            seenTimestamps.push(castTime)
            uniqueCasts.push(cast)
          }
        }

        setCasts(uniqueCasts)
      } catch (error) {
        console.error('Error fetching casts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCasts()
  }, [])

  if (loading || casts.length < 2) return null

  return (
    <div className="w-full mb-12 relative">
      <h1 className="text-3xl font-bold mb-6 text-center">Breaking on RumourNews</h1>
      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="animate-spin w-8 h-8 text-white" />
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 w-full">
          {casts.slice(0, 2).map((cast) => (
            <div
              key={cast.hash}
              className="mb-6 p-6 border border-red-500 rounded-xl bg-gray-900 text-white shadow-lg break-inside-avoid"
            >
              <p className="font-bold text-lg break-words">{cast.text.split('\n')[0]}</p>
              <hr className="border-gray-600 my-2" />
              {cast.text.includes('\n') && (
                <p className="mb-2 break-words">{cast.text.split('\n').slice(1).join('\n')}</p>
              )}
              <span className="text-gray-400 text-sm block mb-4">
                {new Date(cast.timestamp).toLocaleString()}
              </span>
              <a
                href={`https://warpcast.com/rumour-reporter/${cast.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4"
              >
                <button className="px-4 py-2 bg-[#7C65C1] text-white rounded-full font-semibold cursor-pointer hover:text-zinc-400 hover:scale-110 w-full">
                  View on Warpcast
                </button>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function FarcasterCastsSection() {
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

        // Remove duplicates with a 20-second window
        const uniqueCasts = []
        const seenTimestamps = []

        for (const cast of data.casts || []) {
          const castTime = new Date(cast.timestamp).getTime()

          // Check if any existing timestamp is within 20 seconds
          if (!seenTimestamps.some((time) => Math.abs(time - castTime) <= 20000)) {
            seenTimestamps.push(castTime)
            uniqueCasts.push(cast)
          }
        }

        setCasts(uniqueCasts)
      } catch (error) {
        console.error('Error fetching casts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCasts()
  }, [])

  return (
    <div className="w-full mb-12 relative">
      <h1 className="text-3xl font-bold mb-6 text-center">News from this week</h1>
      <hr className="border-white/10 my-4" />
      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="animate-spin w-8 h-8 text-white" />
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 gap-6">
          {casts.length <= 2 ? (
            <p className="text-gray-500 text-center">No casts available.</p>
          ) : (
            casts.slice(2).map((cast) => (
              <div
                key={cast.hash}
                className="mb-6 p-6 border border-purple-500 rounded-xl bg-gray-900 text-white shadow-lg break-inside-avoid"
              >
                <p className="font-bold text-lg break-words">{cast.text.split('\n')[0]}</p>
                <hr className="border-gray-600 my-2" />
                {cast.text.includes('\n') && (
                  <p className="mb-2 break-words">{cast.text.split('\n').slice(1).join('\n')}</p>
                )}
                <span className="text-gray-400 text-sm block mb-4">
                  {new Date(cast.timestamp).toLocaleString()}
                </span>
                <a href={`/posts/${cast.hash}`} className="block mt-4">
                  <button className="text-sm px-4 py-2 bg-[#7C65C1] text-white rounded-full font-semibold cursor-pointer hover:text-zinc-400 hover:scale-110">
                    Read on Warpcast
                  </button>
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
