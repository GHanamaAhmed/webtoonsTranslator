/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  env: {
    PUSHER_KEY: process.env.PUSHER_KEY,
    PUSHER_CLUSTER: process.env.PUSHER_CLUSTER,
    CLOUDINARY_UPLOADPRESET: process.env.CLOUDINARY_UPLOADPRESET,
    CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_API_KEY: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
  },
};

export default nextConfig;
