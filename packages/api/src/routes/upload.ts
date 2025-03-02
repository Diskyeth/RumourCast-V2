import { t } from 'elysia'
import { createElysia } from '../utils'

export const uploadRoutes = createElysia({ prefix: '/upload' }).post(
  '/',
  async ({ body }) => {
    try {
      const { image } = body

      if (!image) {
        throw new Error('No image file provided')
      }

      // Optional: Add file size validation
      if (image.size > 10 * 1024 * 1024) {
        // 10MB limit
        throw new Error('File size exceeds 10MB limit')
      }

      const data = await uploadImage(image)
      return {
        success: true,
        ...data,
      }
    } catch (error) {
      console.error('Upload error:', error)

      if (error instanceof Error) {
        if (error.message.includes('failed to fetch')) {
          throw new Error('Upload service unavailable')
        }
        throw error
      }
      throw new Error('Upload failed')
    }
  },
  {
    body: t.Object({
      image: t.File(),
    }),
    type: 'multipart/form-data',
    error({ error }) {
      if (error instanceof Error) {
        if (error.message.includes('Upload service unavailable')) {
          return {
            success: false,
            error: error.message,
            status: 503,
          }
        }
        if (error.message.includes('File size exceeds')) {
          return {
            success: false,
            error: error.message,
            status: 413,
          }
        }
        if (error.message.includes('No image file')) {
          return {
            success: false,
            error: error.message,
            status: 400,
          }
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        status: 500,
      }
    },
    plugins: {
      // Set maximum file size to 10MB
      maxFileSize: 10 * 1024 * 1024,
    },
  }
)

async function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.UPLOAD_API_KEY ?? ''}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Upload failed: ${errorText}`)
  }

  const jsonResponse = await response.json()
  console.log('ImgBB Raw Response:', JSON.stringify(jsonResponse, null, 2)) // Debugging log

  // Validate response structure
  if (!jsonResponse.data || !jsonResponse.data.url) {
    throw new Error(`Invalid response format: ${JSON.stringify(jsonResponse)}`)
  }

  return {
    success: true,
    imageUrl: jsonResponse.data.url, // Direct link to the image
    displayUrl: jsonResponse.data.display_url, // Publicly viewable link
    deleteUrl: jsonResponse.data.delete_url, // Deletion URL if needed
    width: jsonResponse.data.width,
    height: jsonResponse.data.height,
    size: jsonResponse.data.size,
  }
}