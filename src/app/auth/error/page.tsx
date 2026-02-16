// Auth error page
// Shown when email verification fails

import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-charcoal-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold text-warmwhite mb-4">
          Authentication Error
        </h1>
        <p className="text-warmwhite-muted mb-8">
          There was a problem verifying your account. The link may have expired
          or already been used.
        </p>
        <Link
          href="/builder"
          className="inline-flex items-center justify-center px-6 py-3 bg-spark text-charcoal-dark font-medium rounded-full hover:bg-spark-400 transition-colors"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
