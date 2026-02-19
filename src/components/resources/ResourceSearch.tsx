"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function ResourceSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/resources?search=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router]
  );

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search grants, accelerators, SBA resources..."
          className="w-full px-6 py-4 pl-14 bg-charcoal border border-warmwhite/10 rounded-full text-warmwhite placeholder:text-warmwhite-dim focus:outline-none focus:border-spark/50 focus:ring-2 focus:ring-spark/20 transition-all"
        />
        <svg
          className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-warmwhite-dim"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-spark hover:bg-spark-400 text-charcoal-dark font-semibold rounded-full transition-colors text-sm"
        >
          Search
        </button>
      </div>
    </form>
  );
}
