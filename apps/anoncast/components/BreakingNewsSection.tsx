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

        // Remove duplicates by timestamp
        const uniqueCasts = []
        const seenTimestamps = new Set()

        for (const cast of data.casts || []) {
          if (!seenTimestamps.has(cast.timestamp)) {
            seenTimestamps.add(cast.timestamp)
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
    <div className="max-w-screen mb-12 relative">
      <h1 className="text-3xl font-bold mb-6 text-center">Breaking on RumourNews</h1>
      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="animate-spin w-8 h-8 text-white" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 auto-rows-min w-full">
          {casts.slice(0, 2).map((cast) => (
            <div
              key={cast.hash}
              className="p-6 border border-red-500 rounded-xl bg-gray-900 text-white shadow-lg overflow-hidden break-words whitespace-normal w-full"
            >
              <p className="font-bold text-lg break-words whitespace-normal">
                {cast.text.split('\n')[0]}
              </p>
              <hr className="border-gray-600 my-2" />
              {cast.text.includes('\n') && (
                <p className="mb-2 break-words whitespace-normal">
                  {cast.text.split('\n').slice(1).join('\n')}
                </p>
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
                <button className="text-sm px-4 py-2 bg-[#7C65C1] text-white rounded-full font-semibold cursor-pointer hover:text-zinc-400 hover:scale-110">
                  Read on Warpcast
                </button>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
