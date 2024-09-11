"use client";
import React, { ReactNode } from "react";
import { Elements, PaymentElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(`${process.env.STRIPE_API_KEY}`);

export default function Stripe({ clientSecret }: { clientSecret: string }) {
  const stripeOptions = {
    // passing the client secret obtained from the server
    clientSecret: clientSecret,
  };

  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <PaymentElement />
    </Elements>
  );
}
