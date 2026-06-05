/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: process.env.BASEPATH,

  eslint: {
    ignoreDuringBuilds: true, // ✅ This disables ESLint checks during production builds
  },

  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig
