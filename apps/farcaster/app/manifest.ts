import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RumourCast',
    short_name: 'Rumour',
    description: 'Spread Rumours',
    start_url: '/',
    display: 'standalone',
    background_color: '#0000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/icons/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
