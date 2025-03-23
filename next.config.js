/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'this-is-a-secret-value-for-repotronium-development',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
    // Do not expose OPENAI_API_KEY to client-side code for security
    // Instead, we'll use a feature flag to indicate availability
    HAS_OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'true' : 'false',
  },
  // Configure server-side environment variables
  serverRuntimeConfig: {
    // Will only be available on the server side
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  },
  // Add various security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig