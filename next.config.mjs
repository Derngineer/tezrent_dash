/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,
  // Uncomment output: 'standalone' only for Docker deployments
  // For Vercel/Netlify, leave it commented out
  // output: 'standalone'
}

export default nextConfig
