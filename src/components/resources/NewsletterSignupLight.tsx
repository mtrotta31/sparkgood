// Newsletter Signup Component (Light Theme)
// Warm, inviting email capture for directory pages

"use client";

import { useState } from "react";
import { analytics } from "@/components/analytics/GoogleAnalytics";

interface NewsletterSignupLightProps {
  city?: string;
  state?: string;
  variant?: "inline" | "card" | "hero";
}

export default function NewsletterSignupLight({
  city,
  state,
  variant = "card",
}: NewsletterSignupLightProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          city,
          state,
          interests: ["resources"],
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("success");
        setEmail("");
        analytics.newsletterSignup(city, state);
      } else {
        setErrorMessage(result.error || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  // Success state
  if (status === "success") {
    return (
      <div
        className={`${
          variant === "card"
            ? "p-6 rounded-2xl bg-emerald-50 border border-emerald-200"
            : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="text-slate-800 font-medium">You&apos;re subscribed!</p>
            <p className="text-slate-600 text-sm">
              We&apos;ll notify you when new resources are added
              {city && state ? ` in ${city}, ${state}` : ""}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Hero variant (large, for bottom of page)
  if (variant === "hero") {
    return (
      <div className="bg-gradient-to-br from-spark/5 via-accent/5 to-transparent rounded-3xl p-8 md:p-12 border border-spark/10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-spark/10 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-7 h-7 text-spark"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-slate-800 mb-3">
            Stay in the loop
          </h3>
          <p className="text-slate-600 mb-8 max-w-lg mx-auto">
            Get notified when we add new grants, accelerators, and resources
            {city && state ? ` in ${city}, ${state}` : " in your area"}.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-5 py-4 rounded-xl bg-white border border-slate-200
                text-slate-800 placeholder:text-slate-400
                focus:outline-none focus:border-spark focus:ring-4 focus:ring-spark/10
                shadow-warm transition-all"
              disabled={status === "loading"}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-8 py-4 bg-spark hover:bg-spark-600 text-white font-semibold
                rounded-xl transition-all shadow-warm hover:shadow-warm-md disabled:opacity-50 whitespace-nowrap"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          {status === "error" && (
            <p className="text-red-600 text-sm mt-3">{errorMessage}</p>
          )}

          <p className="text-slate-500 text-xs mt-4">
            No spam, unsubscribe anytime. We only send resource updates.
          </p>
        </div>
      </div>
    );
  }

  // Inline variant
  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200
            text-slate-800 placeholder:text-slate-400
            focus:outline-none focus:border-spark focus:ring-4 focus:ring-spark/10
            shadow-warm-sm transition-all"
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-6 py-3 bg-spark hover:bg-spark-600 text-white font-semibold
            rounded-xl transition-all shadow-warm hover:shadow-warm-md disabled:opacity-50 whitespace-nowrap"
        >
          {status === "loading" ? "Subscribing..." : "Get Notified"}
        </button>
        {status === "error" && (
          <p className="text-red-600 text-sm">{errorMessage}</p>
        )}
      </form>
    );
  }

  // Card variant (default)
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-warm">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-11 h-11 rounded-xl bg-spark/10 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-spark"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-slate-800 mb-1">
            Stay Updated
          </h3>
          <p className="text-slate-600 text-sm">
            Get notified when new resources are added
            {city && state ? ` in ${city}, ${state}` : " in your area"}.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-3 rounded-xl bg-cream border border-slate-200
            text-slate-800 placeholder:text-slate-400
            focus:outline-none focus:border-spark focus:ring-4 focus:ring-spark/10
            transition-all"
          disabled={status === "loading"}
        />

        {status === "error" && (
          <p className="text-red-600 text-sm">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full py-3 bg-spark hover:bg-spark-600 text-white font-semibold
            rounded-xl transition-all shadow-warm hover:shadow-warm-md disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {status === "loading" ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Subscribing...
            </>
          ) : (
            "Get Notified"
          )}
        </button>

        <p className="text-slate-500 text-xs text-center">
          No spam, unsubscribe anytime.
        </p>
      </form>
    </div>
  );
}
