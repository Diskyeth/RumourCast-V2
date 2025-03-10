'use client'

/* eslint-disable jsx-a11y/alt-text */
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { useCreatePost } from './context'
import { Image, Link, Loader2, Quote, Reply, SquareSlash, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { type ReactNode, useEffect, useRef, useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'

import { Input } from '../ui/input'
import { useQuery } from '@tanstack/react-query'
import Confetti from 'confetti-react'
import { Checkbox } from '../ui/checkbox'
import { useSDK } from '@anonworld/react'
import { CredentialsSelect } from '../credentials-select'

const MAX_EMBEDS = 2
const baseText = "I heard a rumour... ";

export function CreatePost() {
  const { sdk } = useSDK()
  const {
    text,
    setText,
    createPost,
    isPending,
    quote,
    embed,
    setEmbed,
    setQuote,
    confetti,
    setConfetti,
    credential,
    setRevealPhrase, // Ensure this is included to fix the missing dependency warning
  } = useCreatePost()

  const length = new Blob([text ?? '']).size

  // Handle text change & auto-detect links
  const handleSetText = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value ?? ""
    if (new Blob([newValue]).size > 320) return

    setText(newValue)

    // Check for Warpcast URLs
    const warpcastRegex = /https:\/\/warpcast\.com\/[^/]+\/0x[a-fA-F0-9]+/g
    const warpcastMatches = [...newValue.matchAll(warpcastRegex)].map(match => match[0])

    // Check for Twitter URLs
    const twitterRegex = /https:\/\/(twitter\.com|x\.com)\/[^/]+\/status\/\d+/g
    const twitterMatches = [...newValue.matchAll(twitterRegex)].map(match => match[0])

    // Handle Warpcast URLs
    if (warpcastMatches.length > 0) {
      const urlHash = warpcastMatches[0].split('/').pop()
      if (!quote || quote.hash !== urlHash) {
        sdk.getFarcasterCast(warpcastMatches[0]).then((data) => {
          if (data.data) setQuote(data.data)
        })
      }
    }

    // Handle Twitter URLs
    if (twitterMatches.length > 0 && (!embed || embed !== twitterMatches[0])) {
      setEmbed(twitterMatches[0])
    }
  }, [setText, setQuote, setEmbed, sdk, quote, embed])

  // Fix useEffect missing dependency warning
  useEffect(() => {
    setRevealPhrase?.("Initial Value") // Or the correct initialization logic
  }, [setRevealPhrase])

  return (
    <div className="flex flex-col gap-4">
      <RemoveableParent />
      <Credential />

      <Textarea
        value={text ?? baseText}
        onChange={handleSetText}
        className="h-32 p-3 resize-none font-medium !text-base placeholder:text-zinc-400 bg-zinc-950 border border-zinc-700"
        onKeyDown={(e) => {
          if (
            e.target.selectionStart < baseText.length &&
            ["Backspace", "Delete"].includes(e.key)
          ) {
            e.preventDefault()
          }
        }}
        onFocus={(e) => {
          if (!text || !text.startsWith(baseText)) {
            setText(baseText)
          }

          requestAnimationFrame(() => {
            e.target.setSelectionRange(baseText.length, baseText.length)
          })
        }}
      />
      <RevealPhrase />
      <RemoveableImage />
      <RemoveableEmbed />
      <RemoveableQuote />
      <div className="flex flex-col sm:flex-row justify-between gap-4 xs:gap-0">
        <div className="flex gap-4">
          <UploadImage />
          <EmbedLink />
          <ParentCast />
          <QuoteCast />
          <Channel />
        </div>
        <div className="flex flex-row items-center gap-4 sm: justify-between">
          <p className="font-medium text-zinc-400">{`${length} / 320`}</p>
          <Button
            onClick={createPost}
            className="font-bold text-lg px-4 py-6 rounded-full hover:scale-105 transition-all duration-300"
            disabled={isPending || !credential || !text}
          >
            {isPending ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Generating proof</p>
              </div>
            ) : (
              'Cast rumour 👀'
            )}
          </Button>
        </div>
      </div>
      {confetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          colors={[
            '#C848FF', // Vibrant purple
            '#FFFFFF', // Pure white
          ]}
          drawShape={(ctx) => {
            const shapeType = Math.floor(Math.random() * 3) // Randomly pick a shape
            ctx.beginPath()
            ctx.lineWidth = 2

            switch (shapeType) {
              case 0: // Circle
                ctx.arc(0, 0, 8, 0, Math.PI * 2, true)
                break

              case 1: // Star
                for (let i = 0; i < 5; i++) {
                  const angle = ((Math.PI * 2) / 5) * i
                  const x = Math.cos(angle) * 8
                  const y = Math.sin(angle) * 8
                  ctx.lineTo(x, y)
                }
                ctx.closePath()
                break

              case 2: // Square
                ctx.rect(-8, -8, 16, 16)
                break

              default:
                break
            }

            ctx.stroke()
            ctx.closePath()
          }}
          gravity={0.25}
          recycle={false}
          onConfettiComplete={() => setConfetti(false)}
        />
      )}
    </div>
  )
}

function TooltipButton({
  children,
  tooltip,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode
  tooltip: string
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            disabled={disabled}
            className={className}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function UploadImage() {
  const { sdk } = useSDK()
  const { setImage, embedCount, image } = useCreatePost()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) {
      setError('No file selected')
      return
    }

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      setError('Invalid file type')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await sdk.uploadImage(file)

      if (response.error) {
        throw new Error(response.error.message)
      }

      // ✅ Fix: Expect `imageUrl` from backend, not `data.data.link`
      if (!response.data?.imageUrl) {
        console.error("Unexpected API response:", response.data)
        throw new Error('Invalid response format')
      }

      setImage(response.data.imageUrl)
      setError(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <TooltipButton
        tooltip="Upload image"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading || !!image || embedCount >= MAX_EMBEDS}
        className="w-full sm:w-auto min-w-10 bg-zinc-950 border border-zinc-700"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={false}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageSelect}
        />
        {loading ? <Loader2 className="animate-spin" /> : <Image />}
      </TooltipButton>

      {error && (
        <div className="absolute top-12 left-0 z-10 bg-red-100 text-red-700 px-3 py-2 rounded-xl text-sm">
          {error}
        </div>
      )}
    </div>
  )
}

function RemoveableImage() {
  const { image, setImage } = useCreatePost()
  if (!image) return null
  return (
    <div className="relative">
      <img src={image} alt="Uploaded" />
      <Button variant="outline" size="icon" onClick={() => setImage(null)} className="absolute top-1 right-1">
        <X />
      </Button>
    </div>
  )
}

function EmbedLink() {
  const { setEmbed, embedCount, embed } = useCreatePost()
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)

  const handleEmbed = () => {
    if (value) {
      setEmbed(value)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipButton
          tooltip="Embed link"
          disabled={!!embed || embedCount >= MAX_EMBEDS}
          className="w-full sm:w-auto min-w-10 bg-zinc-950 border border-zinc-700"
        >
          <Link />
        </TooltipButton>
      </DialogTrigger>
      <DialogContent className="bg-black">
        <DialogHeader>
          <DialogTitle className="text-foreground">Embed link</DialogTitle>
          <DialogDescription>You can embed any website.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col  gap-4 py-4 ">
          <Input
            id="link"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleEmbed}>Embed</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RemoveableEmbed() {
  const { embed, setEmbed } = useCreatePost()
  const { data: opengraph } = useQuery({
    queryKey: ['opengraph', embed],
    queryFn: embed
      ? async () => {
          const response = await fetch(`/api/opengraph?url=${embed}`)
          const data = await response.json()
          return data
        }
      : undefined,
    enabled: !!embed,
  })

  if (!embed || !opengraph) return null

  const image =
    opengraph?.ogImage?.[0]?.url ?? opengraph.twitterImage?.[0]?.url ?? opengraph.favicon
  const title = opengraph.ogTitle ?? opengraph.twitterTitle ?? opengraph.dcTitle
  const description =
    opengraph.ogDescription ??
    opengraph.twitterDescription?.[0] ??
    opengraph.dcDescription

  return (
    <div className="relative">
      <div
        className="w-full border rounded-xl overflow-hidden cursor-pointer"
        onClick={() => window.open(embed, '_blank')}
      >
        {image && (
          <img
            src={image}
            alt={opengraph.dcTitle}
            className="object-cover aspect-video"
          />
        )}
        <div className="p-2">
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-zinc-400">{description}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setEmbed(null)}
        className="absolute top-1 right-1"
      >
        <X />
      </Button>
    </div>
  )
}

function ParentCast() {
  const { sdk } = useSDK()
  const { setParent, parent } = useCreatePost()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSetParent = async () => {
    setLoading(true)
    if (value) {
      const data = await sdk.getFarcasterCast(value)
      setParent(data.data ?? null)
    }
    setOpen(false)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipButton
          tooltip="Reply to post"
          disabled={!!parent}
          className="w-full sm:w-auto min-w-10 bg-zinc-950 border border-zinc-700"
        >
          <Reply />
        </TooltipButton>
      </DialogTrigger>
      <DialogContent className="bg-black">
        <DialogHeader>
          <DialogTitle className="text-foreground">Reply to post</DialogTitle>
          <DialogDescription>
            You can only reply to posts from Warpcast.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col  gap-4 py-4">
          <Input
            id="parent"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://warpcast.com/..."
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSetParent} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RemoveableParent() {
  const { parent, setParent } = useCreatePost()
  if (!parent) return null

  return (
    <div className="relative">
      <div
        className="w-full border rounded-xl p-2 overflow-hidden cursor-pointer flex flex-col gap-2"
        onClick={() =>
          window.open(
            `https://warpcast.com/${parent.author.username}/${parent.hash}`,
            '_blank'
          )
        }
      >
        <p className="text-sm text-zinc-400">Replying to</p>
        {parent.author && (
          <div className="flex items-center gap-2">
            <img
              src={parent.author.pfp_url}
              alt={parent.author.username}
              className="w-6 h-6 rounded-xl"
            />
            <p className="text-md font-bold">{parent.author.username}</p>
          </div>
        )}
        <p className="text-md line-clamp-2">{parent.text}</p>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setParent(null)}
        className="absolute top-1 right-1"
      >
        <X />
      </Button>
    </div>
  )
}

function Channel() {
  const { sdk } = useSDK()
  const { setChannel, channel } = useCreatePost()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(channel?.id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSetChannel = async () => {
    if (!value) {
      // clearing the channel
      setChannel(null)
      setOpen(false)
      return
    }

    setLoading(true)
    setError(null) // Clear any previous error
    try {
      const data = await sdk.getFarcasterChannel(value.replace('/', ''))
      if (!data.data) {
        setError("Couldn't find that channel.")
      } else {
        setChannel(data.data)
        setOpen(false)
      }
    } catch (e) {
      console.error(e)
      setError(`Something went wrong.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipButton
          tooltip="Channel"
          className="w-full sm:w-auto min-w-10 bg-zinc-950 border border-zinc-700"
        >
          {channel ? (
            <img
              src={channel.image_url}
              alt={channel.name}
              className="rounded-xl w-full h-full object-cover"
            />
          ) : (
            <SquareSlash />
          )}
        </TooltipButton>
      </DialogTrigger>
      <DialogContent className="text-foreground bg-background">
        <DialogHeader>
          <DialogTitle>Channel</DialogTitle>
          <DialogDescription>You can set a channel for your post.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Input
            id="channel"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="memes"
          />
          {error && <p className="text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSetChannel} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function QuoteCast() {
  const { sdk } = useSDK()
  const { setQuote, embedCount, quote, setEmbed } = useCreatePost()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSetQuote = async () => {
    setLoading(true)
    if (value) {
      if (value.includes('x.com') || value.includes('twitter.com')) {
        setEmbed(value)
      } else {
        const data = await sdk.getFarcasterCast(value)
        setQuote(data.data ?? null)
      }
    }
    setOpen(false)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipButton
          tooltip="Quote post"
          disabled={!!quote || embedCount >= MAX_EMBEDS}
          className="w-full sm:w-auto min-w-10 bg-zinc-950 border border-zinc-700"
        >
          <Quote />
        </TooltipButton>
      </DialogTrigger>
      <DialogContent className="bg-black">
        <DialogHeader>
          <DialogTitle>Quote post</DialogTitle>
          <DialogDescription>
            You can quote posts from Warpcast or X/Twitter.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col  gap-4 py-4">
          <Input
            id="quote"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://warpcast.com/..., https://x.com/..."
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSetQuote} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RemoveableQuote() {
  const { quote, setQuote } = useCreatePost()
  if (!quote) return null

  return (
    <div className="relative">
      <div
        className="w-full border rounded-xl p-2 overflow-hidden cursor-pointer flex flex-col gap-2"
        onClick={() =>
          window.open(
            `https://warpcast.com/${quote.author.username}/${quote.hash}`,
            '_blank'
          )
        }
      >
        <p className="text-sm text-zinc-400">Quoting</p>
        <div className="flex items-center gap-2">
          <img
            src={quote.author.pfp_url}
            alt={quote.author.username}
            className="w-6 h-6 rounded-xl"
          />
          <p className="text-md font-bold">{quote.author.username}</p>
        </div>
        <p className="text-md line-clamp-2">{quote.text}</p>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setQuote(null)}
        className="absolute top-1 right-1"
      >
        <X />
      </Button>
    </div>
  )
}

function RevealPhrase() {
  const [enabled, setEnabled] = useState(false)
  const { revealPhrase, setRevealPhrase } = useCreatePost()

  useEffect(() => {
    if (!enabled) {
      setRevealPhrase(null)
    }
  }, [enabled])

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex flex-row items-center gap-2 cursor-pointer"
        onClick={() => setEnabled(!enabled)}
      >
        <Checkbox checked={enabled} />
        <p className="text-sm">Reveal yourself at a later date</p>
      </div>
      {enabled && (
        <div className="flex flex-col gap-4">
          <p className="text-gray-400">
            Enter a complex secret phrase you&apos;ll remember. Use it later to reveal
            yourself.
          </p>
          <Input
            value={revealPhrase ?? ''}
            onChange={(e) => setRevealPhrase(e.target.value)}
            placeholder="a phrase that's hard to guess"
            className="bg-[#0D0D0D]"
          />
        </div>
      )}
    </div>
  )
}

function Credential() {
  const { credential, setCredential } = useCreatePost()
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col">
        <span className="text-sm font-semibold">
          Post Credential <span className="text-red-500">*</span>
        </span>
        <span className="text-sm text-zinc-400">
          RumourCast requires a verified credential for at least 100M $RUMOUR.
        </span>
      </div>
      <CredentialsSelect selected={credential} onSelect={setCredential} />
    </div>
  )
}
