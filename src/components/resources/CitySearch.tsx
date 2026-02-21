// City Search Component with Autocomplete
// "Search your city..." with dropdown suggestions

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Location {
  id: string;
  city: string;
  state: string;
  slug: string;
  listing_count: number;
}

interface CitySearchProps {
  placeholder?: string;
  className?: string;
  locations: Location[];
}

export default function CitySearch({
  placeholder = "Search your city...",
  className = "",
  locations,
}: CitySearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Filter locations based on query
  useEffect(() => {
    if (query.length < 2) {
      setFilteredLocations([]);
      return;
    }

    const searchLower = query.toLowerCase();
    const filtered = locations
      .filter(
        (loc) =>
          loc.city.toLowerCase().includes(searchLower) ||
          loc.state.toLowerCase().includes(searchLower) ||
          `${loc.city}, ${loc.state}`.toLowerCase().includes(searchLower)
      )
      .sort((a, b) => b.listing_count - a.listing_count)
      .slice(0, 8);

    setFilteredLocations(filtered);
    setHighlightedIndex(-1);
  }, [query, locations]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateToCity = useCallback(
    (location: Location) => {
      setQuery(`${location.city}, ${location.state}`);
      setIsOpen(false);
      router.push(`/resources/${location.slug}`);
    },
    [router]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredLocations.length === 0) {
      if (e.key === "ArrowDown" && filteredLocations.length > 0) {
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredLocations.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          navigateToCity(filteredLocations[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="w-5 h-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 text-lg bg-white rounded-2xl border-2 border-slate-200
            text-slate-800 placeholder:text-slate-400
            focus:outline-none focus:border-spark focus:ring-4 focus:ring-spark/10
            shadow-warm transition-all"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && filteredLocations.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-warm-lg overflow-hidden"
        >
          <ul className="py-2">
            {filteredLocations.map((location, index) => (
              <li key={location.id}>
                <button
                  onClick={() => navigateToCity(location)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                    index === highlightedIndex
                      ? "bg-spark/10 text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className={`w-5 h-5 ${
                        index === highlightedIndex
                          ? "text-spark"
                          : "text-slate-400"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                    <span className="font-medium">
                      {location.city}, {location.state}
                    </span>
                  </div>
                  <span className="text-sm text-slate-500">
                    {location.listing_count} resources
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No results message */}
      {isOpen && query.length >= 2 && filteredLocations.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-warm-lg p-4 text-center text-slate-500">
          No cities found matching &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
