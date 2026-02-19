// Stripe Webhook Handler
// POST /api/stripe/webhook
// Handles Stripe webhook events for payments and subscriptions

import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, PRICING } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Use service role client for webhook (no user auth context)
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase service configuration");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(supabase, session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(supabase, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(supabase, subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(supabase, invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(supabase, invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// Handle successful checkout
async function handleCheckoutComplete(
  supabase: ReturnType<typeof getServiceClient>,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.user_id;
  const purchaseType = session.metadata?.purchase_type;
  const ideaId = session.metadata?.idea_id;

  if (!userId) {
    console.error("No user_id in session metadata");
    return;
  }

  console.log(`Processing checkout: ${purchaseType} for user ${userId}`);

  // Get current credits
  const { data: credits, error: creditsError } = await supabase
    .from("user_credits")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (creditsError && creditsError.code !== "PGRST116") {
    console.error("Error fetching credits:", creditsError);
    return;
  }

  const currentPurchases = credits?.one_time_purchases || [];

  switch (purchaseType) {
    case "deep_dive":
      if (ideaId && !currentPurchases.includes(ideaId)) {
        await supabase.from("user_credits").upsert({
          user_id: userId,
          one_time_purchases: [...currentPurchases, ideaId],
          subscription_tier: credits?.subscription_tier || "free",
          subscription_status: credits?.subscription_status || "none",
          deep_dive_credits_remaining: credits?.deep_dive_credits_remaining || 0,
          launch_kit_credits_remaining: credits?.launch_kit_credits_remaining || 0,
        });
        console.log(`Added deep dive purchase for idea ${ideaId}`);
      }
      break;

    case "launch_kit":
      if (ideaId) {
        const launchKitKey = `launch_kit_${ideaId}`;
        if (!currentPurchases.includes(launchKitKey)) {
          await supabase.from("user_credits").upsert({
            user_id: userId,
            one_time_purchases: [...currentPurchases, launchKitKey],
            subscription_tier: credits?.subscription_tier || "free",
            subscription_status: credits?.subscription_status || "none",
            deep_dive_credits_remaining: credits?.deep_dive_credits_remaining || 0,
            launch_kit_credits_remaining: credits?.launch_kit_credits_remaining || 0,
          });
          console.log(`Added launch kit purchase for idea ${ideaId}`);
        }
      }
      break;

    // Subscriptions are handled by subscription.created event
    case "spark_subscription":
    case "ignite_subscription":
      console.log(`Subscription checkout complete: ${purchaseType}`);
      break;
  }
}

// Handle subscription creation or update
async function handleSubscriptionChange(
  supabase: ReturnType<typeof getServiceClient>,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata?.user_id;
  const tier = subscription.metadata?.tier as "spark" | "ignite" | undefined;

  if (!userId || !tier) {
    console.error("Missing user_id or tier in subscription metadata");
    return;
  }

  const status = subscription.status === "active" ? "active" :
                 subscription.status === "past_due" ? "past_due" : "canceled";

  // Calculate credits based on tier
  const deepDiveCredits = tier === "ignite" ? -1 : PRICING.spark.deepDiveCredits;
  const launchKitCredits = tier === "ignite" ? -1 : PRICING.spark.launchKitCredits;

  // Get current user credits
  const { data: credits } = await supabase
    .from("user_credits")
    .select("*")
    .eq("user_id", userId)
    .single();

  await supabase.from("user_credits").upsert({
    user_id: userId,
    subscription_tier: tier,
    subscription_status: status,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    deep_dive_credits_remaining: deepDiveCredits,
    launch_kit_credits_remaining: launchKitCredits,
    credits_reset_at: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
    one_time_purchases: credits?.one_time_purchases || [],
  });

  console.log(`Subscription ${status}: ${tier} for user ${userId}`);
}

// Handle subscription cancellation
async function handleSubscriptionCanceled(
  supabase: ReturnType<typeof getServiceClient>,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    console.error("Missing user_id in subscription metadata");
    return;
  }

  // Get current purchases to preserve them
  const { data: credits } = await supabase
    .from("user_credits")
    .select("one_time_purchases")
    .eq("user_id", userId)
    .single();

  await supabase.from("user_credits").upsert({
    user_id: userId,
    subscription_tier: "free",
    subscription_status: "canceled",
    stripe_subscription_id: null,
    deep_dive_credits_remaining: 0,
    launch_kit_credits_remaining: 0,
    credits_reset_at: null,
    one_time_purchases: credits?.one_time_purchases || [],
  });

  console.log(`Subscription canceled for user ${userId}`);
}

// Handle successful invoice payment (subscription renewal)
async function handleInvoicePaid(
  supabase: ReturnType<typeof getServiceClient>,
  invoice: Stripe.Invoice
) {
  // Only process subscription invoices
  const invoiceData = invoice as unknown as { subscription?: string | null };
  if (!invoiceData.subscription) return;

  const subscriptionId = invoiceData.subscription;
  const stripe = getStripeClient();

  // Get the subscription to find the user
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.user_id;
  const tier = subscription.metadata?.tier as "spark" | "ignite" | undefined;

  if (!userId || !tier) {
    console.error("Missing metadata in subscription");
    return;
  }

  // Reset credits for the new billing period
  const deepDiveCredits = tier === "ignite" ? -1 : PRICING.spark.deepDiveCredits;
  const launchKitCredits = tier === "ignite" ? -1 : PRICING.spark.launchKitCredits;

  // Get current purchases to preserve them
  const { data: credits } = await supabase
    .from("user_credits")
    .select("one_time_purchases")
    .eq("user_id", userId)
    .single();

  await supabase.from("user_credits").upsert({
    user_id: userId,
    subscription_tier: tier,
    subscription_status: "active",
    deep_dive_credits_remaining: deepDiveCredits,
    launch_kit_credits_remaining: launchKitCredits,
    credits_reset_at: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
    one_time_purchases: credits?.one_time_purchases || [],
  });

  console.log(`Credits reset for ${tier} subscription: user ${userId}`);
}

// Handle failed invoice payment
async function handleInvoiceFailed(
  supabase: ReturnType<typeof getServiceClient>,
  invoice: Stripe.Invoice
) {
  const invoiceData = invoice as unknown as { subscription?: string | null };
  if (!invoiceData.subscription) return;

  const subscriptionId = invoiceData.subscription;
  const stripe = getStripeClient();

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.user_id;

  if (!userId) return;

  // Get current data to preserve
  const { data: credits } = await supabase
    .from("user_credits")
    .select("*")
    .eq("user_id", userId)
    .single();

  await supabase.from("user_credits").upsert({
    user_id: userId,
    subscription_status: "past_due",
    subscription_tier: credits?.subscription_tier || "free",
    deep_dive_credits_remaining: credits?.deep_dive_credits_remaining || 0,
    launch_kit_credits_remaining: credits?.launch_kit_credits_remaining || 0,
    one_time_purchases: credits?.one_time_purchases || [],
  });

  console.log(`Payment failed for user ${userId}`);
}
