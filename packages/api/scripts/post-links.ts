import { and, desc, eq, gte, isNull } from 'drizzle-orm'
import { db } from '../src/db'
import { postLinksTable, postRelationshipsTable, postsTable } from '../src/db/schema'
import { neynar } from '../src/services/neynar'
import { twitter } from '../src/services/twitter'

const POST_ACCOUNT_FID = 937160
const POST_ACCOUNT_TWITTER_USERNAME = 'anonworld_bot'

async function getFarcasterPosts() {
  return await db.db
    .select()
    .from(postsTable)
    .leftJoin(postLinksTable, eq(postsTable.hash, postLinksTable.post_id))
    .where(
      and(
        isNull(postLinksTable.post_id),
        isNull(postsTable.deleted_at),
        gte(postsTable.created_at, new Date('2025-01-01'))
      )
    )
    .orderBy(desc(postsTable.created_at))
}

async function getTwitterPosts() {
  return await db.db
    .select()
    .from(postRelationshipsTable)
    .leftJoin(
      postLinksTable,
      eq(postRelationshipsTable.target_id, postLinksTable.post_id)
    )
    .where(
      and(
        isNull(postLinksTable.post_target),
        eq(postRelationshipsTable.target, 'twitter'),
        isNull(postRelationshipsTable.deleted_at),
        gte(postRelationshipsTable.created_at, new Date('2025-01-09'))
      )
    )
    .orderBy(desc(postRelationshipsTable.created_at))
    // We intentionally limit to 1 to avoid rate limiting
    .limit(1)
}

export async function handleFarcasterPosts() {
  const currentTimestamp = new Date().getTime() / 1000
  const farcasterPosts = await getFarcasterPosts()
  console.log(`[post-links] found ${farcasterPosts.length} farcaster posts missing links`)

  for (const post of farcasterPosts) {
    const link = `https://anon.world/posts/${post.posts.hash}`
    const replyToFid = post.posts.fid.toString()
    const replyToHash = post.posts.hash
    const cast = await neynar.createCast({
      fid: POST_ACCOUNT_FID,
      reply: replyToHash,
      links: [link],
      text: null,
      images: [],
    })
    if (!cast.success) {
      console.error(`[post-links] [farcaster] failed to create cast for ${link}`)
      return currentTimestamp + 60 * 5
    }
    await db.db.insert(postLinksTable).values({
      post_target: 'farcaster',
      post_account: replyToFid,
      post_id: replyToHash,
      reply_target: 'farcaster',
      reply_account: cast.cast.author.fid.toString(),
      reply_id: cast.cast.hash,
    })

    const parentLink = `https://warpcast.com/~/conversations/${replyToHash}`
    const childLink = `https://warpcast.com/~/conversations/${cast.cast.hash}`
    console.log(`[post-links] [farcaster] ${parentLink} -> ${childLink}`)
  }
}

export async function handleTwitterPosts() {
  const currentTimestamp = new Date().getTime() / 1000
  const twitterPosts = await getTwitterPosts()
  console.log(`[post-links] found ${twitterPosts.length} twitter posts missing links`)

  for (const post of twitterPosts) {
    const link = `https://www.rumourcast.fun/posts/${post.post_relationships.post_hash}`
    const replyToAccount = post.post_relationships.target_account
    const replyToTweetId = post.post_relationships.target_id
    const tweet = await twitter.postTweet(POST_ACCOUNT_TWITTER_USERNAME, {
      replyToTweetId,
      text: link,
      images: [],
    })
    if (!tweet.success) {
      if (tweet.error) {
        console.error(`[post-links] [twitter] failed to create tweet for ${link}`)
        return (tweet.rateLimitReset ?? currentTimestamp) + 60 * 10
      }
      console.error(`[post-links] [twitter] skipping tweet for ${link}`)
      await db.relationships.delete('twitter', replyToTweetId)
      continue
    }
    await db.db.insert(postLinksTable).values({
      post_target: 'twitter',
      post_account: replyToAccount,
      post_id: replyToTweetId,
      reply_target: 'twitter',
      reply_account: POST_ACCOUNT_TWITTER_USERNAME,
      reply_id: tweet.tweetId,
    })

    const parentLink = `https://twitter.com/${replyToAccount}/status/${replyToTweetId}`
    const childLink = `https://twitter.com/${POST_ACCOUNT_TWITTER_USERNAME}/status/${tweet.tweetId}`
    console.log(`[post-links] [twitter] ${parentLink} -> ${childLink}`)
  }
}
