import { Spinner, Text, YStack } from '@anonworld/ui'
import { PostDisplay } from '../display'
import { Link } from 'solito/link'
import { useNewPosts, useTrendingPosts } from '../../../hooks'
import { useEffect, useRef } from 'react'
import { useCredentialPosts } from '../../../hooks/use-credential-posts'

export function TrendingFeed({
  fid,
  disableActions,
}: { fid: number; disableActions?: boolean }) {
  const { data, isLoading } = useTrendingPosts({ fid })

  if (isLoading) {
    return <Spinner color="$color12" />
  }

  if (!data || data.length === 0) {
    return (
      <Text fos="$2" fow="400" color="$color11" textAlign="center">
        No posts yet
      </Text>
    )
  }

  return (
    <YStack gap="$4" $xs={{ gap: '$0', bbw: '$0.5', bc: '$borderColor' }}>
      {data?.map((post) => (
        <Link key={post.hash} href={`/posts/${post.hash}`}>
          <PostDisplay post={post} hoverable disableActions={disableActions} />
        </Link>
      ))}
    </YStack>
  )
}

export function NewFeed({
  fid,
  disableActions,
}: { fid: number; disableActions?: boolean }) {
  const { data, isLoading, hasNextPage, fetchNextPage } = useNewPosts({ fid })
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage])

  if (isLoading && !data) {
    return <Spinner color="$color12" />
  }

  if (!data || data.pages[0].length === 0) {
    return (
      <Text fos="$2" fow="400" color="$color11" textAlign="center">
        No posts yet
      </Text>
    )
  }

  return (
    <YStack gap="$4" $xs={{ gap: '$0', bbw: '$0.5', bc: '$borderColor' }}>
      {data.pages.map((page, i) =>
        page.map((post) => (
          <Link key={post.hash} href={`/posts/${post.hash}`}>
            <PostDisplay post={post} hoverable disableActions={disableActions} />
          </Link>
        ))
      )}
      <YStack ai="center" ref={loadMoreRef} p="$2">
        {hasNextPage && <Spinner color="$color12" />}
      </YStack>
    </YStack>
  )
}

export function CredentialPostFeed({ hash }: { hash: string }) {
  const { data, isLoading, hasNextPage, fetchNextPage } = useCredentialPosts({ hash })
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage])

  if (isLoading && !data) {
    return <Spinner color="$color12" />
  }

  if (!data || data.pages[0].length === 0) {
    return (
      <Text fos="$2" fow="400" color="$color11" textAlign="center">
        No posts yet
      </Text>
    )
  }

  return (
    <YStack gap="$4" $xs={{ gap: '$0', bbw: '$0.5', bc: '$borderColor' }}>
      {data.pages.map((page, i) =>
        page.map((post) => (
          <Link key={post.hash} href={`/posts/${post.hash}`}>
            <PostDisplay post={post} hoverable />
          </Link>
        ))
      )}
      {/* <YStack ai="center" ref={loadMoreRef} p="$2">
        {hasNextPage && <Spinner color="$color12" />}
      </YStack> */}
    </YStack>
  )
}
