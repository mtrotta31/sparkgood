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

  // Idempotency check - prevent duplicate processing on webhook retries
  const { error: idempotencyError } = await supabase
    .from('stripe_webhook_events')
    .insert({ event_id: event.id, event_type: event.type });

  if (idempotencyError?.code === '23505') {
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
  }

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

  console.log(`[webhook] checkout.session.completed - metadata:`, {
    userId,
    purchaseType,
    ideaId,
  });

  if (!userId) {
    console.error("[webhook] No user_id in session metadata");
    return;
  }

  // For one-time purchases, record the purchase
  if (purchaseType === "deep_dive" || purchaseType === "launch_kit") {
    if (!ideaId) {
      console.error(`[webhook] No idea_id for ${purchaseType} purchase`);
      return;
    }

    // Determine the purchase key to add
    const purchaseKey = purchaseType === "launch_kit" ? `launch_kit_${ideaId}` : ideaId;

    console.log(`[webhook] Recording purchase: ${purchaseKey} for user ${userId}`);

    // First, ensure the user_credits row exists
    const { data: existingCredits, error: fetchError } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("[webhook] Error fetching credits:", fetchError);
      return;
    }

    if (!existingCredits) {
      // Create new row with the purchase
      const { error: insertError } = await supabase.from("user_credits").insert({
        user_id: userId,
        subscription_tier: "free",
        subscription_status: "none",
        deep_dive_credits_remaining: 0,
        launch_kit_credits_remaining: 0,
        one_time_purchases: [purchaseKey],
      });

      if (insertError) {
        console.error("[webhook] Error inserting credits:", insertError);
        return;
      }

      console.log(`[webhook] Created new credits row with purchase: ${purchaseKey}`);
    } else {
      // Update existing row - append to array if not already present
      const currentPurchases: string[] = existingCredits.one_time_purchases || [];

      if (currentPurchases.includes(purchaseKey)) {
        console.log(`[webhook] Purchase ${purchaseKey} already recorded, skipping`);
        return;
      }

      const updatedPurchases = [...currentPurchases, purchaseKey];

      const { error: updateError } = await supabase
        .from("user_credits")
        .update({ one_time_purchases: updatedPurchases })
        .eq("user_id", userId);

      if (updateError) {
        console.error("[webhook] Error updating purchases:", updateError);
        return;
      }

      console.log(`[webhook] Updated purchases to:`, updatedPurchases);
    }

    return;
  }

  // Subscriptions are handled by subscription.created event
  if (purchaseType === "spark_subscription" || purchaseType === "ignite_subscription") {
    console.log(`[webhook] Subscription checkout complete: ${purchaseType}`);
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
