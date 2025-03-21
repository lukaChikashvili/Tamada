/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["cdn.gencraft.com"],
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
              }
          ],      },
};

export default nextConfig;
