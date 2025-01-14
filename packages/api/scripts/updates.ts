import { db } from '../src/db'
import { buildFeeds } from '../src/routes/feeds'
import { updateLeaderboard } from '../src/routes/leaderboard'
import { neynar } from '../src/services/neynar'
import { tokens } from '../src/services/tokens'
import { handleFarcasterPosts, handleTwitterPosts } from './post-links'

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
  }
}

const updateFarcasterAccounts = async () => {
  const accounts = await db.socials.listFarcasterAccounts()
  const fids = accounts.map((account) => account.fid)
  const users = await neynar.getBulkUsersByFids(fids)
  for (const user of users.users) {
    console.log(`[farcaster] updating account for ${user.fid}`)
    await db.socials.updateFarcasterAccount(user.fid, {
      metadata: user,
    })
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

const main = async () => {
  let i = 0
  let twitterWaitUntilTimestamp: number | undefined = undefined
  while (true) {
    try {
      await handleFarcasterPosts()
      if (
        twitterWaitUntilTimestamp === undefined ||
        twitterWaitUntilTimestamp < new Date().getTime() / 1000
      ) {
        twitterWaitUntilTimestamp = await handleTwitterPosts()
      } else {
        console.log(
          `[updates] [twitter] waiting for ${twitterWaitUntilTimestamp - new Date().getTime() / 1000} seconds`
        )
      }
      if (i % 10 === 0) {
        await updateTokens()
      }
      if (i % 2 === 0) {
        await updateFeeds()
        await updateCommunities()
      }
      if (i % 20 === 0) {
        await updateFarcasterAccounts()
        await updateTwitterAccounts()
      }
      if (i % 100 === 0) {
        console.log('[leaderboard] updating leaderboard')
        await updateLeaderboard()
      }
    } catch (error) {
      console.error('[error]', error)
    }

    console.log('[sleep] waiting 30 seconds...')
    await new Promise((resolve) => setTimeout(resolve, 30000))
    i++
  }
}

main()
  .catch(console.error)
  .then(() => {
    process.exit(0)
  })
