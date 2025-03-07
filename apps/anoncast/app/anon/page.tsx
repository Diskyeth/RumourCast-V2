'use client'

import { CreatePostProvider } from '@/components/create-post/context'

import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatUnits, parseAbiItem } from 'viem'
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

export default function Home() {
  return (
    <CreatePostProvider initialVariant="anon">
      <Inner />
    </CreatePostProvider>
  )
}

function Inner() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 bg-zinc-900 border border-zinc-700 p-4 rounded-lg">
          <span className="font-semibold text-xl text-foreground">$RUMOUR</span>
          <div className="flex flex-row gap-2 justify-between ">
            <div className="flex flex-row gap-2 flex-wrap text-zinc-400">
              <a
                href="https://basescan.org/token/0x1CEcCbE4d3a19cB62DbBd09756A52Cfe5394Fab8"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm decoration-dotted underline font-medium inline"
              >
                Basescan
              </a>
              <a
                href="https://app.interface.social/token/8453/0x1CEcCbE4d3a19cB62DbBd09756A52Cfe5394Fab8"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm decoration-dotted underline font-medium inline"
              >
                Interface
              </a>
              <a
                href="https://dexscreener.com/base/0xc4ecaf115cbce3985748c58dccfc4722fef8247c"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm decoration-dotted underline font-medium inline"
              >
                DEX Screener
              </a>
              <a
                href="https://app.uniswap.org/swap?outputCurrency=0x1CEcCbE4d3a19cB62DbBd09756A52Cfe5394Fab8&chain=base"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm decoration-dotted underline font-medium inline"
              >
                Uniswap
              </a>
            </div>
          </div>
          <BuyBurn />
        </div>
      </div>
    </div>
  )
}

function BuyBurn() {
  const { writeContract, data: hash, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })
  const [timeSinceLastBurn, setTimeSinceLastBurn] = useState(-1)

  const CONTRACT_ADDRESS: `0x${string}` = '0xC70671a8546CF3263B57f817a1c74f697da820C8'

  const { data, refetch } = useReadContract({
    address: '0x4200000000000000000000000000000000000006',
    abi: [parseAbiItem('function balanceOf(address) external view returns (uint256)')],
    functionName: 'balanceOf',
    args: [CONTRACT_ADDRESS],
  })

  const { data: lastBurn, refetch: refetchLastBurn } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: [parseAbiItem('function getLastSwapTimestamp() external view returns (uint40)')],
    functionName: 'getLastSwapTimestamp',
  })

  const handleClick = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: [parseAbiItem('function swapAndBurn() external')],
      functionName: 'swapAndBurn',
    })
  }

  useEffect(() => {
    if (isConfirmed) {
      setTimeSinceLastBurn(-1)
      refetch()
      refetchLastBurn()
    }
  }, [isConfirmed, refetch, refetchLastBurn])

  useEffect(() => {
    const timer = setInterval(() => {
      if (lastBurn) {
        const newSeconds = Math.floor((Date.now() - Number(lastBurn) * 1000) / 1000)
        setTimeSinceLastBurn(newSeconds)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [lastBurn])

  function formatTimeAgo(seconds: number): string {
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="flex flex-col gap-2 mt-4">
      <span className="font-bold text-md text-foreground">
        Burn $ANON via @anonfun fees
      </span>
      <p className="text-sm text-zinc-400">
        @anonfun ETH rewards are used to buy $ANON on Uniswap and burn it. Anyone can
        trigger this process, once per minute, 0.1 ETH of rewards at a time.
      </p>
      <p className="text-sm text-zinc-400">You only pay for the gas fees.</p>
      <div className="flex flex-row justify-between mt-2">
        <p className="text-sm text-foreground">
          Burnable:{' '}
          {data ? `${Number.parseFloat(formatUnits(data, 18)).toFixed(4)} ETH` : '0 ETH'}
        </p>
        <p className="text-sm text-zinc-400">
          {lastBurn && timeSinceLastBurn !== -1
            ? `Last burn: ${formatTimeAgo(timeSinceLastBurn)}`
            : ''}
        </p>
      </div>
      <Button
        onClick={handleClick}
        disabled={
          isConfirming ||
          timeSinceLastBurn < 60 ||
          timeSinceLastBurn === -1 ||
          !data ||
          data === BigInt(0)
        }
      >
        {isConfirming ? (
          <div className="flex flex-row items-center gap-2">
            <Loader2 className="animate-spin" />
            <p>Burning...</p>
          </div>
        ) : timeSinceLastBurn === -1 ? (
          <Loader2 className="animate-spin" />
        ) : timeSinceLastBurn < 60 ? (
          `Wait ${60 - timeSinceLastBurn} seconds`
        ) : isConfirmed ? (
          <div className="flex flex-row items-center gap-2">
            <Check />
            <p>Burned</p>
          </div>
        ) : (
          'Burn $ANON'
        )}
      </Button>
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  )
}
