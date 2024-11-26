import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'viaPrize',
    short_name: 'viaPrize',
    description: 'idea marketplace',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/viaprizeBg.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/viaprizeBg.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
