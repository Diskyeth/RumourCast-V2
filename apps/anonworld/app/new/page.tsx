'use client'

import { useRouter } from 'next/navigation'
import { NewPost, PostFeed, PostFeedSelector } from '@anonworld/react'
import { View, XStack } from '@anonworld/ui'

export default function Home() {
  const router = useRouter()

  const handleSelect = (sort: string) => {
    if (sort === 'new') {
      router.push('/new')
    } else {
      router.push('/')
    }
  }

  const handlePost = (hash: string) => {
    router.push(`/posts/${hash}`)
  }

  return (
    <View maxWidth={700} mx="auto" my="$3" gap="$3">
      <XStack ai="center" jc="space-between">
        <PostFeedSelector selected="New" onSelect={handleSelect} />
        <NewPost onSuccess={handlePost} />
      </XStack>
      <PostFeed
        fid={899289}
        type="new"
        onPress={(hash) => router.push(`/posts/${hash}`)}
      />
    </View>
  )
}
