"use client";

import Link from "next/link";

interface HeaderProps {
  showBackToHome?: boolean;
}

export default function Header({ showBackToHome = true }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-charcoal-dark/95 backdrop-blur-sm border-b border-warmwhite/5">
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="text-sm">✦</span>
          </div>
          <span className="font-display text-warmwhite font-semibold hidden sm:inline">
            SparkGood
          </span>
        </Link>

        {/* Right side */}
        {showBackToHome && (
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-warmwhite-muted hover:text-warmwhite transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        )}
      </div>
    </header>
  );
}
