/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  images: {
    domains: [
      "avatars.githubusercontent.com",
      "lh3.googleusercontent.com",
      "cdn.discordapp.com",
      "your-supabase-project.supabase.co",
    ],
  },
};

module.exports = nextConfig;
