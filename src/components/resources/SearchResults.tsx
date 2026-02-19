"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ResourceListing } from "@/types/resources";
import ResourceListingCard from "./ResourceListingCard";

interface SearchResultsProps {
  initialQuery: string;
}

interface SearchResponse {
  success: boolean;
  data?: {
    listings: ResourceListing[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export default function SearchResults({ initialQuery }: SearchResultsProps) {
  const [results, setResults] = useState<ResourceListing[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      if (!initialQuery) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ query: initialQuery });
        const response = await fetch(`/api/resources/search?${params}`);
        const data: SearchResponse = await response.json();

        if (data.success && data.data) {
          setResults(data.data.listings);
          setPagination(data.data.pagination);
        } else {
          setError(data.error || "Failed to search resources");
        }
      } catch (err) {
        setError("Network error. Please try again.");
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [initialQuery]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-spark border-t-transparent rounded-full animate-spin" />
          <span className="text-warmwhite-muted">Searching resources...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-warmwhite-muted mb-4">{error}</p>
          <Link
            href="/resources"
            className="text-spark hover:text-spark-400 transition-colors"
          >
            Clear search
          </Link>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-warmwhite text-lg mb-2">
            No results found for &quot;{initialQuery}&quot;
          </p>
          <p className="text-warmwhite-muted mb-4">
            Try different keywords or browse by category below.
          </p>
          <Link
            href="/resources"
            className="text-spark hover:text-spark-400 transition-colors"
          >
            Clear search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-warmwhite">
            {pagination.total} result{pagination.total !== 1 ? "s" : ""} for
            &quot;{initialQuery}&quot;
          </h2>
          <Link
            href="/resources"
            className="text-warmwhite-muted hover:text-warmwhite text-sm transition-colors"
          >
            Clear search
          </Link>
        </div>
        <div className="grid gap-4">
          {results.map((listing) => (
            <ResourceListingCard key={listing.id} listing={listing} />
          ))}
        </div>
        {pagination.totalPages > 1 && (
          <div className="mt-8 text-center text-warmwhite-dim text-sm">
            Showing {results.length} of {pagination.total} results
          </div>
        )}
      </div>
    </section>
  );
}
