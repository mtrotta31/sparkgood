// Stripe Checkout Session API
// POST /api/stripe/checkout
// Creates a Stripe Checkout session for one-time purchases or subscriptions

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient, PRICING, PurchaseType } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

interface CheckoutRequest {
  purchaseType: PurchaseType;
  ideaId?: string; // Required for deep_dive and launch_kit purchases
  ideaName?: string; // For display in Stripe
  successUrl?: string;
  cancelUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body: CheckoutRequest = await request.json();
    const { purchaseType, ideaId, ideaName, successUrl, cancelUrl } = body;

    if (!purchaseType) {
      return NextResponse.json(
        { success: false, error: "Purchase type is required" },
        { status: 400 }
      );
    }

    // Validate idea ID for one-time purchases
    if ((purchaseType === "deep_dive" || purchaseType === "launch_kit") && !ideaId) {
      return NextResponse.json(
        { success: false, error: "Idea ID is required for this purchase type" },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const origin = request.headers.get("origin") || "http://localhost:3000";

    // Get or create Stripe customer
    let stripeCustomerId: string;

    // Check if user already has a Stripe customer ID
    const { data: credits } = await supabase
      .from("user_credits")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (credits?.stripe_customer_id) {
      stripeCustomerId = credits.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Save customer ID to database
      await supabase.from("user_credits").upsert({
        user_id: user.id,
        stripe_customer_id: stripeCustomerId,
        subscription_tier: "free",
        subscription_status: "none",
        deep_dive_credits_remaining: 0,
        launch_kit_credits_remaining: 0,
        one_time_purchases: [],
      });
    }

    // Build checkout session based on purchase type
    let sessionConfig: Stripe.Checkout.SessionCreateParams;

    const baseSuccessUrl = successUrl || `${origin}/projects`;
    const baseCancelUrl = cancelUrl || `${origin}/pricing`;

    switch (purchaseType) {
      case "deep_dive":
        sessionConfig = {
          customer: stripeCustomerId,
          mode: "payment",
          allow_promotion_codes: true,
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: PRICING.deepDive.name,
                  description: `Deep dive for: ${ideaName || ideaId}`,
                },
                unit_amount: PRICING.deepDive.price,
              },
              quantity: 1,
            },
          ],
          success_url: `${baseSuccessUrl}?purchase=deep_dive&idea=${ideaId}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: baseCancelUrl,
          metadata: {
            purchase_type: "deep_dive",
            idea_id: ideaId!,
            user_id: user.id,
          },
        };
        break;

      case "launch_kit":
        sessionConfig = {
          customer: stripeCustomerId,
          mode: "payment",
          allow_promotion_codes: true,
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: PRICING.launchKit.name,
                  description: `Launch Kit for: ${ideaName || ideaId}`,
                },
                unit_amount: PRICING.launchKit.price,
              },
              quantity: 1,
            },
          ],
          success_url: `${baseSuccessUrl}?purchase=launch_kit&idea=${ideaId}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: baseCancelUrl,
          metadata: {
            purchase_type: "launch_kit",
            idea_id: ideaId!,
            user_id: user.id,
          },
        };
        break;

      case "spark_subscription":
        sessionConfig = {
          customer: stripeCustomerId,
          mode: "subscription",
          allow_promotion_codes: true,
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: PRICING.spark.name,
                  description: PRICING.spark.description,
                },
                unit_amount: PRICING.spark.price,
                recurring: {
                  interval: "month",
                },
              },
              quantity: 1,
            },
          ],
          success_url: `${baseSuccessUrl}?purchase=spark_subscription&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: baseCancelUrl,
          metadata: {
            purchase_type: "spark_subscription",
            user_id: user.id,
          },
          subscription_data: {
            metadata: {
              user_id: user.id,
              tier: "spark",
            },
          },
        };
        break;

      case "ignite_subscription":
        sessionConfig = {
          customer: stripeCustomerId,
          mode: "subscription",
          allow_promotion_codes: true,
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: PRICING.ignite.name,
                  description: PRICING.ignite.description,
                },
                unit_amount: PRICING.ignite.price,
                recurring: {
                  interval: "month",
                },
              },
              quantity: 1,
            },
          ],
          success_url: `${baseSuccessUrl}?purchase=ignite_subscription&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: baseCancelUrl,
          metadata: {
            purchase_type: "ignite_subscription",
            user_id: user.id,
          },
          subscription_data: {
            metadata: {
              user_id: user.id,
              tier: "ignite",
            },
          },
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid purchase type" },
          { status: 400 }
        );
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create checkout session",
      },
      { status: 500 }
    );
  }
}
