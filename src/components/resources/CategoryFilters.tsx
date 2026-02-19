"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Props {
  category: string;
  states: string[];
  subcategories: string[];
}

export default function CategoryFilters({
  category,
  states,
  subcategories,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentState = searchParams.get("state") || "";
  const currentSubcategory = searchParams.get("subcategory") || "";
  const currentRemote = searchParams.get("remote") === "true";

  const hasFilters = currentState || currentSubcategory || currentRemote;

  const updateFilter = (key: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "") {
      params.set(key, String(value));
    } else {
      params.delete(key);
    }
    router.push(`/resources/${category}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* State filter */}
      {states.length > 0 && (
        <select
          className="px-4 py-2 bg-charcoal border border-warmwhite/10 rounded-full text-warmwhite text-sm focus:outline-none focus:border-spark/50"
          value={currentState}
          onChange={(e) => updateFilter("state", e.target.value)}
        >
          <option value="">All States</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      )}

      {/* Subcategory filter */}
      {subcategories.length > 0 && (
        <select
          className="px-4 py-2 bg-charcoal border border-warmwhite/10 rounded-full text-warmwhite text-sm focus:outline-none focus:border-spark/50"
          value={currentSubcategory}
          onChange={(e) => updateFilter("subcategory", e.target.value)}
        >
          <option value="">All Types</option>
          {subcategories.map((sub) => (
            <option key={sub} value={sub}>
              {sub
                .split("-")
                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}
            </option>
          ))}
        </select>
      )}

      {/* Remote filter */}
      <label className="flex items-center gap-2 px-4 py-2 bg-charcoal border border-warmwhite/10 rounded-full text-warmwhite text-sm cursor-pointer hover:border-warmwhite/20 transition-colors">
        <input
          type="checkbox"
          checked={currentRemote}
          onChange={(e) => updateFilter("remote", e.target.checked)}
          className="rounded border-warmwhite/30 bg-charcoal-light text-spark focus:ring-spark"
        />
        Remote / Nationwide
      </label>

      {/* Clear filters */}
      {hasFilters && (
        <Link
          href={`/resources/${category}`}
          className="px-4 py-2 text-warmwhite-muted hover:text-warmwhite text-sm transition-colors"
        >
          Clear filters
        </Link>
      )}
    </div>
  );
}
