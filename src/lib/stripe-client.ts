// Stripe Client-side utilities
"use client";

import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripePromise(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.warn("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured");
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

// Redirect to Stripe Checkout using the session URL
// This is the recommended approach - the checkout API returns a URL directly
export function redirectToCheckoutUrl(url: string): void {
  window.location.href = url;
}
