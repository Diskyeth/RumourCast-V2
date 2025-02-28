'use client'

import { useBalance } from '@/lib/hooks/use-balance'
import { formatEther } from 'viem'
import { useEffect, useState } from 'react'
import sdk, { FrameContext } from '@farcaster/frame-sdk'

export const ConnectButton = () => {
  const [context, setContext] = useState<FrameContext>()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      setContext(await sdk.context)
      sdk.actions.ready()
    }
    if (sdk && !isLoaded) {
      setIsLoaded(true)
      load()
    }
  }, [isLoaded])

  return (
    <div className="flex flex-row rounded-full overflow-hidden items-center hover:scale-105 transition-all duration-300 gradient-border-wrapper sm:space-x-2 space-x-1 h-14">
      <Balance />
      <div className="text-md font-bold text-primary rounded-full py-2 px-3 m-0.5 truncate">
        {context?.user?.username}
      </div>
    </div>
  )
}

function Balance() {
  const { data } = useBalance()

  const amount = Number.parseFloat(formatEther(data ?? BigInt(0)))

  return (
    <div className="flex items-center">
      <span className="text-md font-bold text-white md:inline hidden pl-3 pr-2">
        {`${formatNumber(amount)} RUMOUR`}
      </span>
      <span
        className="text-sm font-bold text-white md:hidden flex-shrink-0 pl-2 pr-2"
        style={{ maxWidth: '80px', whiteSpace: 'nowrap' }} // Increased maxWidth for visibility
      >
        {`${formatNumber(amount)} R..`}
      </span>
    </div>
  )
}

function formatNumber(num: number) {
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(2)}B` // Billion
  }
  if (num >= 1e6) {
    return `${(num / 1e6).toFixed(2)}M` // Million
  }
  if (num >= 1e3) {
    return `${(num / 1e3).toFixed(2)}K` // Thousand
  }
  return num.toFixed(2)
}
