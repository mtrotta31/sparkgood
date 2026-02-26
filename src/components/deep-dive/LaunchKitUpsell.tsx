"use client";

import { useState } from "react";
import Link from "next/link";

interface LaunchKitUpsellProps {
  onGetLaunchKit: () => void;
}

export default function LaunchKitUpsell({ onGetLaunchKit }: LaunchKitUpsellProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  return (
    <div className="relative mt-8 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-charcoal-light to-charcoal border border-spark/20 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-spark/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      {/* Dismiss button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-warmwhite-muted hover:text-warmwhite hover:bg-warmwhite/5 transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-spark to-accent flex items-center justify-center">
            <svg className="w-5 h-5 text-charcoal-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-lg md:text-xl font-bold text-warmwhite">
              Your business plan is ready
            </h3>
            <p className="text-warmwhite-muted text-sm">
              Now get the tools to launch it
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-warmwhite-muted text-sm mb-6">
          The Launch Kit generates professional marketing assets you can use immediately:
        </p>

        {/* Asset list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-warmwhite/5">
            <span className="text-xl">🌐</span>
            <div>
              <p className="text-warmwhite text-sm font-medium">Landing Page</p>
              <p className="text-warmwhite-muted text-xs">A live, hosted website for your business</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-warmwhite/5">
            <span className="text-xl">📊</span>
            <div>
              <p className="text-warmwhite text-sm font-medium">Pitch Deck</p>
              <p className="text-warmwhite-muted text-xs">Presentation for investors or partners</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-warmwhite/5">
            <span className="text-xl">📱</span>
            <div>
              <p className="text-warmwhite text-sm font-medium">Social Graphics</p>
              <p className="text-warmwhite-muted text-xs">Ready-to-post for Instagram, LinkedIn, Facebook</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-warmwhite/5">
            <span className="text-xl">📄</span>
            <div>
              <p className="text-warmwhite text-sm font-medium">One-Pager</p>
              <p className="text-warmwhite-muted text-xs">Professional PDF to hand out or email</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            onClick={onGetLaunchKit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
              bg-gradient-to-r from-spark to-accent text-charcoal-dark
              hover:opacity-90 hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-spark/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Get Launch Kit — $2.99
          </button>

          <Link
            href="/builder/example?tab=launchkit"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm
              text-warmwhite-muted hover:text-warmwhite hover:bg-warmwhite/5 transition-colors"
          >
            See example
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Subscription hint */}
        <div className="mt-4 pt-4 border-t border-warmwhite/10">
          <Link
            href="/pricing"
            className="text-xs text-warmwhite-muted hover:text-spark transition-colors"
          >
            Want unlimited Launch Kits? Subscribe starting at $14.99/month →
          </Link>
        </div>
      </div>
    </div>
  );
}
