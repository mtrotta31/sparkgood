"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PRICING } from "@/lib/stripe";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  ideaName: string;
  purchaseType: "deep_dive" | "launch_kit";
  hasDeepDive?: boolean; // For launch kit, must already have deep dive
  onBeforeRedirect?: () => void; // Called before redirecting to Stripe
}

export default function PurchaseModal({
  isOpen,
  onClose,
  ideaId,
  ideaName,
  purchaseType,
  hasDeepDive = false,
  onBeforeRedirect,
}: PurchaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseType,
          ideaId,
          ideaName,
          successUrl: `${window.location.origin}${window.location.pathname}?purchase=${purchaseType}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Save session state before redirecting
      if (onBeforeRedirect) {
        onBeforeRedirect();
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
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const pricing = purchaseType === "deep_dive" ? PRICING.deepDive : PRICING.launchKit;
  const isLaunchKitWithoutDeepDive = purchaseType === "launch_kit" && !hasDeepDive;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-charcoal-dark border border-warmwhite/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-warmwhite-muted hover:text-warmwhite transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-spark/10 mb-4">
            {purchaseType === "deep_dive" ? (
              <svg className="w-8 h-8 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            )}
          </div>
          <h2 className="font-display text-2xl font-bold text-warmwhite mb-2">
            {purchaseType === "deep_dive" ? "Unlock Deep Dive" : "Get Launch Kit"}
          </h2>
          <p className="text-warmwhite-muted">
            for <span className="text-warmwhite font-medium">{ideaName}</span>
          </p>
        </div>

        {isLaunchKitWithoutDeepDive ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm text-center">
              You need to purchase a deep dive first before you can add a Launch Kit.
            </p>
          </div>
        ) : (
          <>
            {/* Price */}
            <div className="bg-charcoal-light rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-warmwhite font-medium">{pricing.name}</span>
                <span className="text-2xl font-bold text-spark">{pricing.displayPrice}</span>
              </div>
              <p className="text-warmwhite-dim text-sm">{pricing.description}</p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Purchase button */}
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full py-3 px-4 font-medium rounded-xl
                bg-spark text-charcoal hover:bg-spark-light transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                `Pay ${pricing.displayPrice}`
              )}
            </button>
          </>
        )}

        {/* Subscription upsell */}
        <div className="text-center pt-4 border-t border-warmwhite/10">
          <p className="text-warmwhite-dim text-sm mb-2">
            {purchaseType === "deep_dive"
              ? "Need multiple deep dives?"
              : "Want unlimited Launch Kits?"}
          </p>
          <Link
            href="/pricing"
            className="text-spark hover:text-spark-light text-sm font-medium transition-colors"
          >
            Subscribe starting at {PRICING.spark.displayPrice} →
          </Link>
        </div>
      </div>
    </div>
  );
}
