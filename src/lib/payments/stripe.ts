import Stripe from "stripe";

// Initialize Stripe with the secret key from your environment variables
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

