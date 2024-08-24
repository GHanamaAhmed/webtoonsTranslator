/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PUSHER_KEY: process.env.PUSHER_KEY,
    PUSHER_CLUSTER: process.env.PUSHER_CLUSTER,
  },
};

export default nextConfig;
