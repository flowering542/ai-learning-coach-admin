/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    DATA_DIR: '../ai-learning-coach/data',
    JWT_SECRET: 'coach-admin-secret-key-2025'
  }
}

module.exports = nextConfig
