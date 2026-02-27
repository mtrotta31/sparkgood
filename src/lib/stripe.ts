// Stripe Configuration
// Server-side Stripe client

import Stripe from "stripe";

// Lazy-load Stripe to avoid initialization errors when keys aren't set
let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    });
  }
  return stripeClient;
}

// Pricing configuration
export const PRICING = {
  // One-time purchases
  deepDive: {
    price: 1499, // in cents
    displayPrice: "$14.99",
    priceId: process.env.STRIPE_DEEP_DIVE_PRICE_ID || "",
    name: "Single Deep Dive",
    description: "Unlock viability analysis, business plan, marketing assets, and action roadmap for one idea",
  },
  launchKit: {
    price: 999, // in cents
    displayPrice: "$9.99",
    priceId: process.env.STRIPE_LAUNCH_KIT_PRICE_ID || "",
    name: "Launch Kit Add-on",
    description: "Generate pitch deck, landing page, social graphics, business one-pager, and email templates",
  },

  // Subscriptions
  spark: {
    price: 1499, // in cents per month
    displayPrice: "$14.99/month",
    priceId: process.env.STRIPE_SPARK_PRICE_ID || "",
    name: "Spark Plan",
    description: "5 deep dives + 2 Launch Kits per month",
    features: [
      "5 deep dives per month",
      "2 Launch Kits per month",
      "All 5 deep dive tabs",
      "Save & export projects",
      "Email support",
    ],
    deepDiveCredits: 5,
    launchKitCredits: 2,
  },
  ignite: {
    price: 2999, // in cents per month
    displayPrice: "$29.99/month",
    priceId: process.env.STRIPE_IGNITE_PRICE_ID || "",
    name: "Ignite Plan",
    description: "Unlimited deep dives + Launch Kits + resource matching",
    features: [
      "Unlimited deep dives",
      "Unlimited Launch Kits",
      "Resource matching",
      "Priority generation",
      "All Spark features",
      "Priority support",
    ],
    deepDiveCredits: -1, // -1 = unlimited
    launchKitCredits: -1,
  },
} as const;

export type SubscriptionTier = "free" | "spark" | "ignite";
export type PurchaseType = "deep_dive" | "launch_kit" | "spark_subscription" | "ignite_subscription";

// Helper to check if user has access
export function hasDeepDiveAccess(
  tier: SubscriptionTier,
  creditsRemaining: number,
  purchasedIdeaIds: string[],
  ideaId: string
): boolean {
  // Ignite has unlimited access
  if (tier === "ignite") return true;

  // Check if they've purchased this specific idea
  if (purchasedIdeaIds.includes(ideaId)) return true;

  // Spark plan with credits remaining
  if (tier === "spark" && creditsRemaining > 0) return true;

  return false;
}

export function hasLaunchKitAccess(
  tier: SubscriptionTier,
  creditsRemaining: number,
  purchasedIdeaIds: string[],
  ideaId: string,
  hasDeepDive: boolean
): boolean {
  // Must have deep dive first
  if (!hasDeepDive) return false;

  // Ignite has unlimited access
  if (tier === "ignite") return true;

  // Check if they've purchased launch kit for this idea
  if (purchasedIdeaIds.includes(`launch_kit_${ideaId}`)) return true;

  // Spark plan with credits remaining
  if (tier === "spark" && creditsRemaining > 0) return true;

  return false;
}
