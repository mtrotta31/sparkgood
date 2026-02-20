// Newsletter Signup Component
// Email capture for directory pages - "Get notified about new resources"

"use client";

import { useState } from "react";
import { analytics } from "@/components/analytics/GoogleAnalytics";

interface NewsletterSignupProps {
  city?: string;
  state?: string;
  category?: string;
  variant?: "inline" | "card";
}

export default function NewsletterSignup({
  city,
  state,
  category,
  variant = "card",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
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
          interests: category ? [category] : [],
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("success");
        setEmail("");
        // Track signup
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
      <div className={variant === "card" ? "p-6 rounded-xl bg-green-500/10 border border-green-500/20" : ""}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-warmwhite font-medium">You&apos;re subscribed!</p>
            <p className="text-warmwhite-muted text-sm">
              We&apos;ll notify you when new {category || "resources"} are added
              {city && state ? ` in ${city}, ${state}` : ""}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant (for embedding in other sections)
  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 px-4 py-3 rounded-xl bg-charcoal-light border border-warmwhite/10
            text-warmwhite placeholder:text-warmwhite-dim focus:outline-none focus:border-spark/50"
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-6 py-3 bg-spark hover:bg-spark-400 text-charcoal-dark font-semibold
            rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {status === "loading" ? "Subscribing..." : "Get Notified"}
        </button>
        {status === "error" && (
          <p className="text-red-400 text-sm sm:absolute sm:-bottom-6">{errorMessage}</p>
        )}
      </form>
    );
  }

  // Card variant (default)
  return (
    <div className="p-6 rounded-xl bg-charcoal border border-warmwhite/10">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-spark/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-warmwhite mb-1">
            Stay Updated
          </h3>
          <p className="text-warmwhite-muted text-sm">
            Get notified when new {category ? `${category}s` : "grants and resources"} are added
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
          className="w-full px-4 py-3 rounded-xl bg-charcoal-light border border-warmwhite/10
            text-warmwhite placeholder:text-warmwhite-dim focus:outline-none focus:border-spark/50"
          disabled={status === "loading"}
        />

        {status === "error" && (
          <p className="text-red-400 text-sm">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full py-3 bg-spark hover:bg-spark-400 text-charcoal-dark font-semibold
            rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {status === "loading" ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Subscribing...
            </>
          ) : (
            "Get Notified"
          )}
        </button>

        <p className="text-warmwhite-dim text-xs text-center">
          No spam, unsubscribe anytime. We only send resource updates.
        </p>
      </form>
    </div>
  );
}
