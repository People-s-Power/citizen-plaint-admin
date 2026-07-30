/** @type {import('next').NextConfig} */

// The professional / VA experience now lives entirely in the Experthub Social
// frontend. This admin app is the admin dashboard only, so any legacy
// professional route is permanently redirected to the social app.
const SOCIAL_APP_URL = process.env.NEXT_PUBLIC_SOCIAL_APP_URL || "https://experthubllc.com"

const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/professional/auth/signup",
        destination: `${SOCIAL_APP_URL}/auth?mode=signup&VA=true&redirect=/become-a-professional`,
        permanent: true,
      },
      {
        source: "/professional/auth",
        destination: `${SOCIAL_APP_URL}/auth?VA=true&redirect=/become-a-professional`,
        permanent: true,
      },
      {
        source: "/professional/profile",
        destination: `${SOCIAL_APP_URL}/profile`,
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
