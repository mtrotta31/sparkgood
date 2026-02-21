// CategoryFiltersLight component for light theme
// Enhanced filter bar with category-specific options

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  category: string;
  states: string[];
  cities: string[];
  subcategories: string[];
  totalCount: number;
  filteredCount: number;
}

export default function CategoryFiltersLight({
  category,
  states,
  cities,
  subcategories,
  totalCount,
  filteredCount,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentState = searchParams.get("state") || "";
  const currentCity = searchParams.get("city") || "";
  const [cityInput, setCityInput] = useState(currentCity);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const currentSubcategory = searchParams.get("subcategory") || "";

  // Sync local state with URL params
  useEffect(() => {
    setCityInput(currentCity);
  }, [currentCity]);
  const currentRemote = searchParams.get("remote") === "true";
  const currentSort = searchParams.get("sort") || "relevance";
  const currentOpenOnly = searchParams.get("open") === "true";
  const currentAmountMin = searchParams.get("amount_min") || "";
  const currentAmountMax = searchParams.get("amount_max") || "";

  const hasFilters = currentState || currentCity || currentSubcategory || currentRemote || currentOpenOnly || currentAmountMin || currentAmountMax;

  const updateFilter = (key: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    // Set param if value is truthy (non-empty string or true boolean)
    if (value && (typeof value === "boolean" || value !== "")) {
      params.set(key, String(value));
    } else {
      params.delete(key);
    }
    // Reset page when filters change
    params.delete("page");
    router.push(`/resources/${category}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(`/resources/${category}`);
  };

  // Category-specific sort options
  const getSortOptions = () => {
    const baseOptions = [
      { value: "relevance", label: "Most Relevant" },
      { value: "newest", label: "Newest" },
      { value: "name", label: "Name A-Z" },
    ];

    if (category === "coworking") {
      return [
        ...baseOptions.slice(0, 1),
        { value: "rating", label: "Highest Rated" },
        { value: "price_low", label: "Price: Low to High" },
        { value: "price_high", label: "Price: High to Low" },
        ...baseOptions.slice(1),
      ];
    }

    if (category === "grant") {
      return [
        ...baseOptions.slice(0, 1),
        { value: "amount_high", label: "Amount: High to Low" },
        { value: "deadline", label: "Deadline: Soonest" },
        ...baseOptions.slice(1),
      ];
    }

    if (category === "accelerator" || category === "incubator") {
      return [
        ...baseOptions.slice(0, 1),
        { value: "funding", label: "Funding: High to Low" },
        { value: "deadline", label: "Deadline: Soonest" },
        ...baseOptions.slice(1),
      ];
    }

    return baseOptions;
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
      {/* Main filter row */}
      <div className="flex flex-wrap gap-3">
        {/* State filter */}
        {states.length > 0 && (
          <select
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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

        {/* City search input with debounced autocomplete */}
        <div className="relative">
          <input
            ref={cityInputRef}
            type="text"
            placeholder="Search city..."
            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-40"
            value={cityInput}
            onChange={(e) => {
              const value = e.target.value;
              setCityInput(value);
              setShowCitySuggestions(value.length >= 2);
              // Check if user selected from datalist (exact match)
              if (cities.includes(value)) {
                updateFilter("city", value);
                setShowCitySuggestions(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                updateFilter("city", cityInput);
                setShowCitySuggestions(false);
              } else if (e.key === "Escape") {
                setCityInput(currentCity);
                setShowCitySuggestions(false);
              }
            }}
            onBlur={() => {
              // Delay to allow click on suggestion
              setTimeout(() => setShowCitySuggestions(false), 150);
            }}
            onFocus={() => {
              if (cityInput.length >= 2) {
                setShowCitySuggestions(true);
              }
            }}
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          {/* Custom dropdown instead of datalist for better control */}
          {showCitySuggestions && cities.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {cities
                .filter((city) => city.toLowerCase().includes(cityInput.toLowerCase()))
                .slice(0, 10)
                .map((city) => (
                  <button
                    key={city}
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setCityInput(city);
                      updateFilter("city", city);
                      setShowCitySuggestions(false);
                    }}
                  >
                    {city}
                  </button>
                ))}
              {cities.filter((city) => city.toLowerCase().includes(cityInput.toLowerCase())).length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">No cities found</div>
              )}
            </div>
          )}
        </div>

        {/* Subcategory filter */}
        {subcategories.length > 0 && (
          <select
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            value={currentSubcategory}
            onChange={(e) => updateFilter("subcategory", e.target.value)}
          >
            <option value="">All Types</option>
            {subcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              </option>
            ))}
          </select>
        )}

        {/* Sort dropdown */}
        <select
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          value={currentSort}
          onChange={(e) => updateFilter("sort", e.target.value)}
        >
          {getSortOptions().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Remote / Nationwide toggle */}
        <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm cursor-pointer hover:border-gray-300 transition-colors">
          <input
            type="checkbox"
            checked={currentRemote}
            onChange={(e) => updateFilter("remote", e.target.checked)}
            className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
          />
          Remote / Nationwide
        </label>
      </div>

      {/* Category-specific filters */}
      {category === "grant" && (
        <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-200">
          {/* Open applications only */}
          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm cursor-pointer hover:border-gray-300 transition-colors">
            <input
              type="checkbox"
              checked={currentOpenOnly}
              onChange={(e) => updateFilter("open", e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Open applications only
            </span>
          </label>

          {/* Amount range */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Amount:</span>
            <select
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={currentAmountMin}
              onChange={(e) => updateFilter("amount_min", e.target.value)}
            >
              <option value="">Min</option>
              <option value="1000">$1K+</option>
              <option value="5000">$5K+</option>
              <option value="10000">$10K+</option>
              <option value="25000">$25K+</option>
              <option value="50000">$50K+</option>
              <option value="100000">$100K+</option>
            </select>
            <span className="text-gray-400">-</span>
            <select
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={currentAmountMax}
              onChange={(e) => updateFilter("amount_max", e.target.value)}
            >
              <option value="">Max</option>
              <option value="10000">$10K</option>
              <option value="25000">$25K</option>
              <option value="50000">$50K</option>
              <option value="100000">$100K</option>
              <option value="500000">$500K</option>
              <option value="1000000">$1M+</option>
            </select>
          </div>
        </div>
      )}

      {/* Filter summary and clear */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredCount.toLocaleString()}</span>
          {filteredCount !== totalCount && (
            <span> of {totalCount.toLocaleString()}</span>
          )}{" "}
          results
        </p>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
