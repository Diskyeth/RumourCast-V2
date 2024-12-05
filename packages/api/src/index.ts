import { t } from 'elysia'
import { createElysia } from './utils'
import { feedRoutes } from './routes/feed'
import { postRoutes } from './routes/post'
import { uploadRoutes } from './routes/upload'
import { neynar } from './services/neynar'

const app = createElysia()
  .use(feedRoutes)
  .use(postRoutes)
  .use(uploadRoutes)
  .get(
    '/get-cast',
    async ({ query }) => {
      const response = await neynar.getCast(query.identifier)
      return response.cast
    },
    {
      query: t.Object({
        identifier: t.String(),
      }),
    }
  )
  .get(
    '/get-channel',
    async ({ query }) => {
      const response = await neynar.getChannel(query.identifier)
      return response.channel
    },
    {
      query: t.Object({
        identifier: t.String(),
      }),
    }
  )
  .get(
    '/validate-frame',
    async ({ query }) => {
      return await neynar.validateFrame(query.data)
    },
    {
      query: t.Object({
        data: t.String(),
      }),
    }
  )
  .get(
    '/identity',
    async ({ query }) => {
      try {
        const users = await neynar.getBulkUsers([query.address.toLowerCase()])
        return users?.[query.address.toLowerCase()]?.[0]
      } catch (e) {
        return null
      }
    },
    {
      query: t.Object({
        address: t.String(),
      }),
    }
  )

app.listen(3001)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
