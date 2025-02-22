import https from 'node:https'
import {
  ApiResponseError,
  SendTweetV2Params,
  TwitterApi,
  TwitterApiError,
} from 'twitter-api-v2'
import { db } from '../db'

type TwitterConfig = {
  appKey: string
  appSecret: string
  accessToken: string
  accessSecret: string
}

export class TwitterService {
  private client!: TwitterApi

  async refreshClient(username: string) {
    const account = await db.socials.getTwitterAccount(username)
    if (!account) {
      throw new Error('Twitter account not found')
    }

    this.client = new TwitterApi(account.secrets as TwitterConfig)
  }

  async uploadMedia(username: string, image: string) {
    await this.refreshClient(username)

    const { data: binaryData, mimeType } = await new Promise<{
      data: Buffer
      mimeType: string
    }>((resolve, reject) => {
      https
        .get(image, (res) => {
          res.setEncoding('binary')
          let data = Buffer.alloc(0)

          res.on('data', (chunk) => {
            data = Buffer.concat([data, Buffer.from(chunk, 'binary')])
          })
          res.on('end', () => {
            const mimeType = res.headers['content-type'] || 'image/jpeg'
            resolve({ data, mimeType })
          })
        })
        .on('error', (e) => {
          reject(e)
        })
    })

    return await this.client.v1.uploadMedia(binaryData as unknown as Buffer, {
      mimeType,
    })
  }

  async deleteTweet(username: string, tweetId: string) {
    await this.refreshClient(username)
    return await this.client.v2.deleteTweet(tweetId)
  }

  async postTweet(
    username: string,
    args: {
      text: string
      images: string[]
      quoteTweetId?: string
      replyToTweetId?: string
    }
  ): Promise<
    | { success: true; tweetId: string }
    | { success: false; error?: TwitterApiError; rateLimitReset?: number }
  > {
    await this.refreshClient(username)
    const mediaIds = await Promise.all(
      args.images.map((image) => this.uploadMedia(username, image))
    )

    const params: SendTweetV2Params = {}
    if (mediaIds.length > 0) {
      params.media = {
        media_ids: mediaIds.slice(0, 4) as [string, string, string, string],
      }
    }

    if (args.quoteTweetId) {
      params.quote_tweet_id = args.quoteTweetId
    }
    if (args.replyToTweetId) {
      params.reply = {
        in_reply_to_tweet_id: args.replyToTweetId,
      }
    }

    try {
      const result = await this.client.v2.tweet(args.text, params)
      if (result?.data?.id) {
        return { success: true, tweetId: result.data.id }
      }
    } catch (e) {
      const error = e as ApiResponseError
      if (
        error.data.detail ===
        'You attempted to reply to a Tweet that is deleted or not visible to you.'
      ) {
        return { success: false }
      }

      console.log(error.data, error.rateLimit)

      return { success: false, error: error, rateLimitReset: error.rateLimit?.reset }
    }

    return { success: false }
  }
}

export const twitter = new TwitterService()
