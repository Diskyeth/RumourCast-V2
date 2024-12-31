export type ApiResponse<T> =
  | {
      data: T
      error?: never
    }
  | {
      data?: never
      error: {
        message: string
        status: number
      }
    }

export type RequestConfig = {
  authenticated?: boolean
  headers?: Record<string, string>
  isFormData?: boolean
} & Omit<RequestInit, 'headers'>

export type UploadImageResponse = {
  success: boolean
  status: number
  data?: {
    link: string
  }
  error?: string
}

export type User = {
  object: string
  fid: number
  username: string
  display_name: string
  pfp_url: string
  custody_address: string
  profile: {
    bio: {
      text: string
    }
    location: {
      latitude: number
      longitude: number
      address: {
        city: string
        state: string
        state_code: string
        country: string
        country_code: string
      }
    }
  }
  follower_count: number
  following_count: number
  verifications: Array<string>
  verified_addresses: {
    eth_addresses: Array<string>
    sol_addresses: Array<any>
  }
  verified_accounts: Array<{
    platform: string
    username: string
  }>
  power_badge: boolean
}

export type Channel = {
  id: string
  url: string
  name: string
  description: string
  object: string
  created_at: number
  follower_count: number
  external_link: {
    title: string
    url: string
  }
  image_url: string
  parent_url: string
  lead: {
    object: string
    fid: number
    username: string
    display_name: string
    custody_address: string
    pfp_url: string
    profile: {
      bio: {
        text: string
        mentioned_profiles: Array<string>
      }
      location: {
        latitude: number
        longitude: number
        address: {
          city: string
          state: string
          state_code: string
          country: string
          country_code: string
        }
      }
    }
    follower_count: number
    following_count: number
    verifications: Array<string>
    verified_addresses: {
      eth_addresses: Array<string>
      sol_addresses: Array<string>
    }
    verified_accounts: Array<{
      platform: string
      username: string
    }>
    power_badge: boolean
    experimental: {
      neynar_user_score: number
    }
    viewer_context: {
      following: boolean
      followed_by: boolean
      blocking: boolean
      blocked_by: boolean
    }
  }
  moderator_fids: Array<number>
  member_count: number
  pinned_cast_hash: string
  viewer_context: {
    following: boolean
    role: string
  }
}

export type Cast = {
  hash: string
  parent_hash: string
  parent_url: string
  root_parent_url: string
  parent_author: {
    fid: number
  }
  author: {
    object: string
    fid: number
    username: string
    display_name: string
    custody_address: string
    pfp_url: string
    profile: {
      bio: {
        text: string
        mentioned_profiles: Array<string>
      }
      location: {
        latitude: number
        longitude: number
        address: {
          city: string
          state: string
          state_code: string
          country: string
          country_code: string
        }
      }
    }
    follower_count: number
    following_count: number
    verifications: Array<string>
    verified_addresses: {
      eth_addresses: Array<string>
      sol_addresses: Array<string>
    }
    verified_accounts: Array<{
      platform: string
      username: string
    }>
    power_badge: boolean
    experimental: {
      neynar_user_score: number
    }
    viewer_context: {
      following: boolean
      followed_by: boolean
      blocking: boolean
      blocked_by: boolean
    }
  }
  text: string
  timestamp: string
  embeds: Array<Embed>
  type: string
  frames: Array<{
    version: string
    image: string
    buttons: Array<{
      title: string
      index: number
      action_type: string
      target: string
      post_url: string
    }>
    post_url: string
    frames_url: string
    title: string
    image_aspect_ratio: string
    input: {
      text: string
    }
    state: {
      serialized: string
    }
  }>
  reactions: {
    likes: Array<{
      fid: number
    }>
    recasts: Array<{
      fid: number
      fname: string
    }>
    likes_count: number
    recasts_count: number
  }
  replies: {
    count: number
  }
  thread_hash: string
  mentioned_profiles: Array<{
    object: string
    fid: number
    username: string
    display_name: string
    custody_address: string
    pfp_url: string
    profile: {
      bio: {
        text: string
        mentioned_profiles: Array<string>
      }
      location: {
        latitude: number
        longitude: number
        address: {
          city: string
          state: string
          state_code: string
          country: string
          country_code: string
        }
      }
    }
    follower_count: number
    following_count: number
    verifications: Array<string>
    verified_addresses: {
      eth_addresses: Array<string>
      sol_addresses: Array<string>
    }
    verified_accounts: Array<{
      platform: string
      username: string
    }>
    power_badge: boolean
    experimental: {
      neynar_user_score: number
    }
    viewer_context: {
      following: boolean
      followed_by: boolean
      blocking: boolean
      blocked_by: boolean
    }
  }>
  channel?: Channel
  viewer_context: {
    liked: boolean
    recasted: boolean
  }
  author_channel_context: {
    following: boolean
    role: string
  }
  reveal?: Reveal
  relationships: Array<Relationship>
  credentials: Array<Credential>
  aggregate: {
    likes: number
    replies: number
  }
  user?: {
    liked: boolean
  }
}

export type Reveal = {
  revealHash: string
  input: string
  phrase?: string
  signature?: string
  address?: string
  revealedAt: string
}

export type Relationship = {
  target: string
  targetAccount: string
  targetId: string
  farcaster?: FarcasterAccount
  twitter?: TwitterAccount
  community?: Community
}

export type Credential = {
  id: string
  displayId: string
  credential_id: string
  proof: {
    proof: number[]
    publicInputs: string[]
  }
  metadata: {
    chainId: number
    tokenAddress: `0x${string}`
    balance: string
  }
  verified_at: string
  token?: Token
  vault_id: string | null
}

export enum CredentialType {
  ERC20_BALANCE = 'ERC20_BALANCE',
}

export type Embed = {
  url?: string
  metadata?: {
    _status: string
    content_type: string
    content_length: number
    image: {
      height_px: number
      width_px: number
    }
    video: {
      duration_s: number
      stream: Array<{
        codec_name: string
        height_px: number
        width_px: number
      }>
    }
    html: {
      favicon: string
      modifiedTime: string
      ogArticleAuthor: string
      ogArticleExpirationTime: string
      ogArticleModifiedTime: string
      ogArticlePublishedTime: string
      ogArticlePublisher: string
      ogArticleSection: string
      ogArticleTag: string
      ogAudio: string
      ogAudioSecureURL: string
      ogAudioType: string
      ogAudioURL: string
      ogAvailability: string
      ogDate: string
      ogDescription: string
      ogDeterminer: string
      ogEpisode: string
      ogImage: Array<{
        height: string
        type: string
        url: string
        width: string
        alt: string
      }>
      ogLocale: string
      ogLocaleAlternate: string
      ogLogo: string
      ogMovie: string
      ogPriceAmount: string
      ogPriceCurrency: string
      ogProductAvailability: string
      ogProductCondition: string
      ogProductPriceAmount: string
      ogProductPriceCurrency: string
      ogProductRetailerItemId: string
      ogSiteName: string
      ogTitle: string
      ogType: string
      ogUrl: string
      ogVideo: Array<{
        height: string
        type: string
        url: string
        width: string
      }>
      ogVideoActor: string
      ogVideoActorId: string
      ogVideoActorRole: string
      ogVideoDirector: string
      ogVideoDuration: string
      ogVideoOther: string
      ogVideoReleaseDate: string
      ogVideoSecureURL: string
      ogVideoSeries: string
      ogVideoTag: string
      ogVideoTvShow: string
      ogVideoWriter: string
      ogWebsite: string
      updatedTime: string
      oembed: {
        type: string
        version: string
        title: string
        author_name: string
        author_url: string
        provider_name: string
        provider_url: string
        cache_age: string
        thumbnail_url: string
        thumbnail_width: number
        thumbnail_height: number
        html: string
        width: number
        height: number
      }
    }
  }
  cast?: {
    hash: string
    parent_hash: string
    parent_url: string
    root_parent_url: string
    parent_author: {
      fid: number
    }
    author: {
      object: string
      fid: number
      username: string
      display_name: string
      pfp_url: string
    }
    text: string
    timestamp: string
    type: string
    embeds: Array<Embed>
    channel: {
      id: string
      name: string
      object: string
      image_url: string
      viewer_context: {
        following: boolean
        role: string
      }
    }
  }
}

export type ConversationCast = Cast & {
  direct_replies: Array<ConversationCast>
}

export type CreatePostActionData = {
  text: string | null
  reply: string | null
  links: string[]
  images: string[]
  revealHash?: string
  copyActionIds?: string[]
}

export type DeletePostFarcasterActionData = {
  hash: string
}

export type DeletePostTwitterActionData = {
  tweetId: string
}

export type CopyPostFarcasterActionData = {
  hash: string
}

export type CopyPostTwitterActionData = {
  hash: string
  reply?: boolean
}

export type ExecuteActionData =
  | CreatePostActionData
  | DeletePostFarcasterActionData
  | DeletePostTwitterActionData
  | CopyPostFarcasterActionData
  | CopyPostTwitterActionData

export type ExecuteAction = {
  credentials: string[]
  actionId: string
  data: ExecuteActionData
}

type BaseAction = {
  id: string
  created_at: Date
  updated_at: Date
  credential_id: string | null
  credential_requirement: CredentialRequirement | null
  trigger: string
  community: Community | null
}

export type CredentialRequirement = {
  chainId: number
  tokenAddress: `0x${string}`
  minimumBalance: string
}

export type ActionTargetPost = {
  post: {
    text: {
      eq?: string[]
      ne?: string[]
    }
  }
}

export type Action =
  | (BaseAction & {
      type: ActionType.COPY_POST_TWITTER
      metadata: {
        twitter: string
        target: ActionTargetPost
      }
    })
  | (BaseAction & {
      type: ActionType.DELETE_POST_TWITTER
      metadata: {
        twitter: string
      }
    })
  | (BaseAction & {
      type: ActionType.COPY_POST_FARCASTER
      metadata: {
        fid: number
        target: ActionTargetPost
      }
    })
  | (BaseAction & {
      type: ActionType.DELETE_POST_FARCASTER
      metadata: {
        fid: number
      }
    })
  | (BaseAction & {
      type: ActionType.CREATE_POST
      metadata: {
        target: ActionTargetPost
      }
    })

export enum ActionType {
  CREATE_POST = 'CREATE_POST',
  COPY_POST_TWITTER = 'COPY_POST_TWITTER',
  COPY_POST_FARCASTER = 'COPY_POST_FARCASTER',
  DELETE_POST_TWITTER = 'DELETE_POST_TWITTER',
  DELETE_POST_FARCASTER = 'DELETE_POST_FARCASTER',
}

export interface FungiblePosition {
  type: string
  id: string
  attributes: {
    parent: null
    protocol: null
    name: string
    position_type: string
    quantity: {
      int: string
      decimals: number
      float: number
      numeric: string
    }
    value: number | null
    price: number
    changes: {
      absolute_1d: number | null
      percent_1d: number | null
    } | null
    fungible_info: {
      name: string
      symbol: string
      icon: {
        url: string
      } | null
      flags: {
        verified: boolean
      }
      implementations: {
        chain_id: string
        address: string | null
        decimals: number
      }[]
    }
    flags: {
      displayable: boolean
      is_trash: boolean
    }
    updated_at: string
    updated_at_block: number
  }
  relationships: {
    chain: {
      links: {
        related: string
      }
      data: {
        type: string
        id: string
      }
    }
    fungible: {
      links: {
        related: string
      }
      data: {
        type: string
        id: string
      }
    }
  }
}

export type RevealPostArgs = {
  hash: string
  message: string
  phrase: string
  signature: string
  address: string
}

export type Community = {
  id: string
  name: string
  description: string
  image_url: string
  fid: number
  twitter_username: string
  posts: number
  followers: number
  token: Token
  farcaster: FarcasterAccount
  twitter?: TwitterAccount
  created_at: string
}

export type Token = {
  id: string
  chain_id: number
  address: string
  name: string
  symbol: string
  decimals: number
  image_url?: string
  price_usd: string
  market_cap: number
  total_supply: number
  holders: number
  balance_slot: number
}

export type SwapQuote = {
  buyAmount: string
  liquidityAvailable: boolean
  transaction?: {
    to: `0x${string}`
    value: string
    data: `0x${string}`
  }
}

export type SwapQuoteError = {
  liquidityAvailable: boolean
  error: string
}

export type TwitterAccount = {
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

export type FarcasterAccount = {
  object: 'user'
  fid: number
  username: string
  display_name: string
  custody_address: string
  pfp_url: string
  profile: {
    bio: {
      text: string
      mentioned_profiles: string[]
    }
    location: {
      latitude: number
      longitude: number
      address: {
        city: string
        state: string
        state_code: string
        country: string
        country_code: string
      }
    }
  }
  follower_count: number
  following_count: number
  verifications: string[]
  verified_addresses: {
    eth_addresses: string[]
    sol_addresses: string[]
  }
  verified_accounts?: [
    {
      platform: 'x'
      username: string
    },
  ]
  power_badge: boolean
  experimental: {
    neynar_user_score: number
  }
  viewer_context: {
    following: boolean
    followed_by: boolean
    blocking: boolean
    blocked_by: boolean
  }
}

export type Vault = {
  id: string
  created_at: string
  posts: number
  credentials: Array<Credential>
}
