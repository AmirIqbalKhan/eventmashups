/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'stripe.com'],
  },
  env: {
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
  },
}

module.exports = nextConfig 