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
  formData.append('image', file) // ImgBB requires "image"

  const apiKey = process.env.UPLOAD_API_KEY ?? ''
  if (!apiKey) {
    throw new Error('UPLOAD_API_KEY is missing! Set it in your environment variables.')
  }

  console.log('Uploading image with API Key:', apiKey) // Debugging log

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  })

  const result = await response.text();
  console.log('Raw Response:', result); // Debugging output

  try {
    const jsonResponse = JSON.parse(result);

    if (!jsonResponse || jsonResponse.status !== 200) {
      throw new Error(`Upload failed: ${jsonResponse.error?.message || 'Unknown error'}`);
    }

    return {
      success: true,
      message: 'Upload successful',
      imageUrl: jsonResponse.data.url, // Main image URL
      thumbnailUrl: jsonResponse.data.thumb?.url ?? null, // Thumbnail URL
      width: jsonResponse.data.width,
      height: jsonResponse.data.height,
      size: jsonResponse.data.size,
      deleteUrl: jsonResponse.data.delete_url, // Deletion link
    };
  } catch (error) {
    throw new Error(`Invalid response format: ${result}`);
  }
}