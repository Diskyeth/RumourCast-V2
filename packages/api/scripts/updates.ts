import { db } from '../src/db'
import { buildFeeds } from '../src/routes/feeds'
import { updateLeaderboard } from '../src/routes/leaderboard'
import { neynar } from '../src/services/neynar'
import { tokens } from '../src/services/tokens'
import { handleFarcasterPosts, handleTwitterPosts } from './post-links'
import { syncCommunityWallet } from './sync-fees'

const updateFeeds = async () => {
  const accounts = await db.socials.listFarcasterAccounts()
  for (const account of accounts) {
    console.log(`[feed] updating feeds for ${account.fid}`)
    await buildFeeds(account.fid)
  }
}

const updateTokens = async () => {
  const communityTokens = await db.tokens.list()
  for (const token of communityTokens) {
    console.log(`[token] updating token for ${token.id}`)
    if (token.type === 'ERC20') {
      await tokens.updateERC20(token)
    } else if (token.type === 'ERC721') {
      await tokens.updateERC721(token)
    } else if (token.type === 'NATIVE') {
      await tokens.updateNative(token)
    }
  }
}

const updateCommunities = async () => {
  const communities = await db.communities.list()
  for (const community of communities) {
    console.log(`[community] updating community for ${community.id}`)
    const posts = await db.posts.countForFid(community.fid)
    const followers =
      (community.farcaster?.follower_count ?? 0) + (community.twitter?.followers ?? 0)
    await db.communities.update(community.id, {
      posts,
      followers,
    })
    await syncCommunityWallet(community)
  }
}

const updateFarcasterAccounts = async () => {
  const accounts = await db.socials.listFarcasterAccounts()
  const fids = accounts.map((account) => account.fid)
  for (let i = 0; i < fids.length; i += 100) {
    const batch = fids.slice(i, i + 100)
    console.log(
      `[farcaster] processing batch ${i / 100 + 1} of ${Math.ceil(fids.length / 100)}`
    )
    const users = await neynar.getBulkUsersByFids(batch)
    for (const user of users.users) {
      console.log(`[farcaster] updating account for ${user.fid}`)
      await db.socials.updateFarcasterAccount(user.fid, {
        metadata: user,
      })
    }
  }
}

const updateTwitterAccounts = async () => {
  const accounts = await db.socials.listTwitterAccounts()
  for (const account of accounts) {
    console.log(`[twitter] updating account for ${account.username}`)
    const response = await fetch(`https://api.fxtwitter.com/${account.username}`)
    const data: {
      code: number
      message: string
      user: {
        url: string
        id: string
        followers: number
        following: number
        likes: number
        tweets: number
        name: string
        screen_name: string
        description: string
        location: string
        banner_url: string
        avatar_url: string
        joined: string
        website: any
      }
    } = await response.json()

    await db.socials.updateTwitterAccount(account.username, {
      metadata: data.user,
    })
  }
}

const safeAwait = async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
  try {
    return await fn()
  } catch (error) {
    console.error('[safeAwait]', error)
    return undefined
  }
}

const main = async () => {
  while (true) {
    try {
      await safeAwait(updateFeeds)
      await safeAwait(updateTokens)
      await safeAwait(updateFarcasterAccounts)
      await safeAwait(updateTwitterAccounts)
      await safeAwait(updateCommunities)
      console.log('[leaderboard] updating leaderboard')
      await safeAwait(updateLeaderboard)

      // Optional: uncomment if needed
      // await safeAwait(handleFarcasterPosts)
      // await safeAwait(handleTwitterPosts)
    } catch (error) {
      console.error('[error]', error)
    }

    console.log('[sleep] waiting 12 hours...')
    await new Promise((resolve) => setTimeout(resolve, 12 * 60 * 60 * 1000)) // 12 hours
  }
}

main()
  .catch(console.error)
  .then(() => {
    process.exit(0)
  })
