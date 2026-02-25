"use client";

import { useState, useEffect, useRef } from "react";
import { Button, FadeIn } from "@/components/ui";
import { US_STATES } from "@/lib/constants";
import type { UserLocation } from "@/types";

interface LocationProps {
  value: UserLocation | null;
  onChange: (value: UserLocation | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Location({
  value,
  onChange,
  onNext,
  onBack,
}: LocationProps) {
  const [city, setCity] = useState(value?.city || "");
  const [state, setState] = useState(value?.state || "");

  // Use ref to avoid onChange in dependency array (prevents infinite loop when parent doesn't memoize)
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Update parent when values change
  useEffect(() => {
    if (city && state) {
      onChangeRef.current({ city, state });
    } else if (!city && !state) {
      onChangeRef.current(null);
    }
  }, [city, state]);

  const handleSkip = () => {
    onChange(null);
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <FadeIn duration={400}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-warmwhite-muted hover:text-warmwhite transition-colors mb-8"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
      </FadeIn>

      <FadeIn delay={100} duration={500}>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-warmwhite mb-3">
          Where are you based?
        </h2>
      </FadeIn>

      <FadeIn delay={200} duration={500}>
        <p className="text-warmwhite-muted text-lg mb-8">
          This helps us find local resources, competitors, and opportunities in
          your area. Skip if you prefer not to say or are targeting nationally.
        </p>
      </FadeIn>

      <FadeIn delay={300} duration={400}>
        <div className="space-y-4 mb-8">
          {/* City input */}
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-warmwhite-muted mb-2"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Austin, Brooklyn, San Francisco"
              className="w-full px-4 py-3 bg-charcoal-light border border-warmwhite/10 rounded-xl
                text-warmwhite placeholder-warmwhite-dim
                focus:outline-none focus:ring-2 focus:ring-spark/50 focus:border-spark/50
                transition-all duration-200"
            />
          </div>

          {/* State dropdown */}
          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-warmwhite-muted mb-2"
            >
              State
            </label>
            <select
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-4 py-3 bg-charcoal-light border border-warmwhite/10 rounded-xl
                text-warmwhite
                focus:outline-none focus:ring-2 focus:ring-spark/50 focus:border-spark/50
                transition-all duration-200 appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
              }}
            >
              <option value="" className="bg-charcoal-dark">
                Select a state...
              </option>
              {US_STATES.map((s) => (
                <option key={s.value} value={s.value} className="bg-charcoal-dark">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={400} duration={400}>
        <div className="space-y-3">
          <Button
            onClick={onNext}
            disabled={!city || !state}
            fullWidth
            size="lg"
          >
            Continue
          </Button>
          <button
            onClick={handleSkip}
            className="w-full py-3 text-warmwhite-muted hover:text-warmwhite transition-colors text-sm"
          >
            Skip for now
          </button>
        </div>
      </FadeIn>
    </div>
  );
}
