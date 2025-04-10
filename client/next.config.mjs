/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsHmrCache: false, 
  },
  serverActions: {
    bodySizeLimit: '10mb', 
  },
    images: {
        
        remotePatterns: [
            {
              protocol: 'https',
              hostname: 'dynamic-media-cdn.tripadvisor.com',
            },
            {
              protocol: 'https',
              hostname: 'avatars.mds.yandex.net',
            },
            {
              protocol: 'https',
              hostname: 'example.com',
            },

            {
                protocol: 'https',
                hostname: 'tsiskvili.ge',
              },

              {
                protocol: 'https',
                hostname: 'kwhwuapwfbfrepzfxkeu.supabase.co'
              },

              {
                protocol: 'https',
                hostname: 'cdn.gencraft.com'
              }
          ],      },
};

export default nextConfig;
