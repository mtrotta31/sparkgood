"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { PRICING } from "@/lib/stripe";
import Footer from "@/components/ui/Footer";

export default function PricingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (purchaseType: "spark_subscription" | "ignite_subscription") => {
    if (!user) {
      // Redirect to sign in
      window.location.href = "/auth/signin?redirect=/pricing";
      return;
    }

    setLoading(purchaseType);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseType,
          successUrl: `${window.location.origin}/projects?purchase=${purchaseType}`,
          cancelUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.data.url) {
        window.location.href = data.data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Purchase error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Header */}
      <header className="border-b border-warmwhite/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <span className="font-display text-xl font-bold text-warmwhite">SparkLocal</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/projects"
                className="text-sm text-warmwhite-muted hover:text-warmwhite transition-colors"
              >
                My Projects
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm text-warmwhite-muted hover:text-warmwhite transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-warmwhite mb-4">
            Turn Ideas Into <span className="text-spark">Action</span>
          </h1>
          <p className="text-lg md:text-xl text-warmwhite-muted max-w-2xl mx-auto">
            From idea to launch. Get market research, business plans, marketing assets, and action roadmaps — everything you need to start your business.
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-16">
          {/* Free Tier */}
          <div className="bg-charcoal-light rounded-2xl p-6 md:p-8 border border-warmwhite/10">
            <div className="mb-6">
              <h2 className="font-display text-xl font-bold text-warmwhite mb-2">Free</h2>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-warmwhite">$0</span>
              </div>
              <p className="text-warmwhite-muted text-sm">Start exploring your ideas</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-sm text-warmwhite-muted">
                <span className="text-green-400 mt-0.5">✓</span>
                Unlimited idea generation
              </li>
              <li className="flex items-start gap-2 text-sm text-warmwhite-muted">
                <span className="text-green-400 mt-0.5">✓</span>
                4 tailored ideas per session
              </li>
              <li className="flex items-start gap-2 text-sm text-warmwhite-muted">
                <span className="text-green-400 mt-0.5">✓</span>
                Regenerate ideas anytime
              </li>
              <li className="flex items-start gap-2 text-sm text-warmwhite-dim">
                <span className="text-warmwhite-dim mt-0.5">—</span>
                Deep dive analysis
              </li>
              <li className="flex items-start gap-2 text-sm text-warmwhite-dim">
                <span className="text-warmwhite-dim mt-0.5">—</span>
                Launch Kit
              </li>
            </ul>

            <Link
              href="/builder"
              className="block w-full py-3 px-4 text-center font-medium rounded-xl
                bg-warmwhite/10 text-warmwhite hover:bg-warmwhite/20 transition-colors"
            >
              Start Free
            </Link>
          </div>

          {/* Spark Plan */}
          <div className="bg-charcoal-light rounded-2xl p-6 md:p-8 border-2 border-spark relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-spark text-charcoal text-xs font-bold rounded-full">
              MOST POPULAR
            </div>

            <div className="mb-6">
              <h2 className="font-display text-xl font-bold text-warmwhite mb-2">Spark</h2>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-spark">{PRICING.spark.displayPrice.replace("/month", "")}</span>
                <span className="text-warmwhite-muted">/month</span>
              </div>
              <p className="text-warmwhite-muted text-sm">{PRICING.spark.description}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {PRICING.spark.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-warmwhite-muted">
                  <span className="text-spark mt-0.5">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePurchase("spark_subscription")}
              disabled={loading === "spark_subscription" || authLoading}
              className="block w-full py-3 px-4 text-center font-medium rounded-xl
                bg-spark text-charcoal hover:bg-spark-light transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "spark_subscription" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                "Subscribe to Spark"
              )}
            </button>
          </div>

          {/* Ignite Plan */}
          <div className="bg-charcoal-light rounded-2xl p-6 md:p-8 border border-warmwhite/10">
            <div className="mb-6">
              <h2 className="font-display text-xl font-bold text-warmwhite mb-2">Ignite</h2>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-warmwhite">{PRICING.ignite.displayPrice.replace("/month", "")}</span>
                <span className="text-warmwhite-muted">/month</span>
              </div>
              <p className="text-warmwhite-muted text-sm">{PRICING.ignite.description}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {PRICING.ignite.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-warmwhite-muted">
                  <span className="text-green-400 mt-0.5">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePurchase("ignite_subscription")}
              disabled={loading === "ignite_subscription" || authLoading}
              className="block w-full py-3 px-4 text-center font-medium rounded-xl
                bg-warmwhite/10 text-warmwhite hover:bg-warmwhite/20 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "ignite_subscription" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                "Subscribe to Ignite"
              )}
            </button>
          </div>
        </div>

        {/* Pay-per-use Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-2xl font-bold text-warmwhite text-center mb-8">
            Or Pay Per Use
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-charcoal-light rounded-xl p-6 border border-warmwhite/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-warmwhite">{PRICING.deepDive.name}</h3>
                  <p className="text-warmwhite-muted text-sm">{PRICING.deepDive.description}</p>
                </div>
                <div className="text-2xl font-bold text-spark">{PRICING.deepDive.displayPrice}</div>
              </div>
              <p className="text-warmwhite-dim text-xs">
                One-time purchase. Unlocks all 5 deep dive tabs (foundation, checklist, growth, financial, local resources) for one idea.
              </p>
            </div>

            <div className="bg-charcoal-light rounded-xl p-6 border border-warmwhite/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-warmwhite">{PRICING.launchKit.name}</h3>
                  <p className="text-warmwhite-muted text-sm">{PRICING.launchKit.description}</p>
                </div>
                <div className="text-2xl font-bold text-spark">{PRICING.launchKit.displayPrice}</div>
              </div>
              <p className="text-warmwhite-dim text-xs">
                Requires a deep dive purchase first. Generates complete professional launch package.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-warmwhite text-center mb-8">
            Compare Plans
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-warmwhite/10">
                  <th className="text-left py-4 px-4 text-warmwhite font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-warmwhite-muted font-medium">Free</th>
                  <th className="text-center py-4 px-4 text-warmwhite-muted font-medium">Pay-per-use</th>
                  <th className="text-center py-4 px-4 text-spark font-medium">Spark</th>
                  <th className="text-center py-4 px-4 text-warmwhite font-medium">Ignite</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-warmwhite/5">
                  <td className="py-3 px-4 text-warmwhite-muted">Idea generation</td>
                  <td className="py-3 px-4 text-center text-green-400">Unlimited</td>
                  <td className="py-3 px-4 text-center text-green-400">Unlimited</td>
                  <td className="py-3 px-4 text-center text-green-400">Unlimited</td>
                  <td className="py-3 px-4 text-center text-green-400">Unlimited</td>
                </tr>
                <tr className="border-b border-warmwhite/5">
                  <td className="py-3 px-4 text-warmwhite-muted">Deep dives</td>
                  <td className="py-3 px-4 text-center text-warmwhite-dim">—</td>
                  <td className="py-3 px-4 text-center text-warmwhite-muted">$14.99 each</td>
                  <td className="py-3 px-4 text-center text-warmwhite-muted">5/month</td>
                  <td className="py-3 px-4 text-center text-green-400">Unlimited</td>
                </tr>
                <tr className="border-b border-warmwhite/5">
                  <td className="py-3 px-4 text-warmwhite-muted">Launch Kits</td>
                  <td className="py-3 px-4 text-center text-warmwhite-dim">—</td>
                  <td className="py-3 px-4 text-center text-warmwhite-muted">$9.99 each</td>
                  <td className="py-3 px-4 text-center text-warmwhite-muted">2/month</td>
                  <td className="py-3 px-4 text-center text-green-400">Unlimited</td>
                </tr>
                <tr className="border-b border-warmwhite/5">
                  <td className="py-3 px-4 text-warmwhite-muted">Resource matching</td>
                  <td className="py-3 px-4 text-center text-warmwhite-dim">—</td>
                  <td className="py-3 px-4 text-center text-warmwhite-dim">—</td>
                  <td className="py-3 px-4 text-center text-warmwhite-dim">—</td>
                  <td className="py-3 px-4 text-center text-green-400">✓</td>
                </tr>
                <tr className="border-b border-warmwhite/5">
                  <td className="py-3 px-4 text-warmwhite-muted">Priority generation</td>
                  <td className="py-3 px-4 text-center text-warmwhite-dim">—</td>
                  <td className="py-3 px-4 text-center text-warmwhite-dim">—</td>
                  <td className="py-3 px-4 text-center text-warmwhite-dim">—</td>
                  <td className="py-3 px-4 text-center text-green-400">✓</td>
                </tr>
                <tr className="border-b border-warmwhite/5">
                  <td className="py-3 px-4 text-warmwhite-muted">Save & export projects</td>
                  <td className="py-3 px-4 text-center text-warmwhite-dim">—</td>
                  <td className="py-3 px-4 text-center text-green-400">✓</td>
                  <td className="py-3 px-4 text-center text-green-400">✓</td>
                  <td className="py-3 px-4 text-center text-green-400">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-warmwhite-muted">Support</td>
                  <td className="py-3 px-4 text-center text-warmwhite-dim">—</td>
                  <td className="py-3 px-4 text-center text-warmwhite-muted">Email</td>
                  <td className="py-3 px-4 text-center text-warmwhite-muted">Email</td>
                  <td className="py-3 px-4 text-center text-green-400">Priority</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="font-display text-2xl font-bold text-warmwhite text-center mb-8">
            Questions?
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-warmwhite mb-2">What&apos;s included in a deep dive?</h3>
              <p className="text-warmwhite-muted text-sm">
                A deep dive includes viability analysis (market research, competitor analysis, scoring), a complete business or project plan, marketing assets (social posts, email templates, landing page copy), and an action roadmap with quick wins and phased tasks.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-warmwhite mb-2">Can I cancel my subscription?</h3>
              <p className="text-warmwhite-muted text-sm">
                Yes, you can cancel anytime. Your subscription will remain active until the end of your billing period. You&apos;ll keep access to any one-time purchases forever.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-warmwhite mb-2">Do unused credits roll over?</h3>
              <p className="text-warmwhite-muted text-sm">
                Credits reset each billing cycle and don&apos;t roll over. Use them or lose them! Consider upgrading to Ignite for unlimited access.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
