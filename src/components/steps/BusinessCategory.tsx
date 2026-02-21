"use client";

import { Button, FadeIn } from "@/components/ui";
import { BUSINESS_CATEGORIES } from "@/lib/constants";
import type { BusinessCategory as BusinessCategoryType } from "@/types";

interface BusinessCategoryProps {
  value: BusinessCategoryType | null;
  onChange: (value: BusinessCategoryType) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BusinessCategory({
  value,
  onChange,
  onNext,
  onBack,
}: BusinessCategoryProps) {
  return (
    <div className="max-w-3xl mx-auto px-4">
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
          What kind of business are you interested in?
        </h2>
      </FadeIn>

      <FadeIn delay={200} duration={500}>
        <p className="text-warmwhite-muted text-lg mb-8">
          Pick the category that best fits your idea. We&apos;ll tailor
          everything to match.
        </p>
      </FadeIn>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {BUSINESS_CATEGORIES.map((category, index) => (
          <FadeIn key={category.id} delay={300 + index * 50} duration={400}>
            <button
              onClick={() => onChange(category.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left h-full flex flex-col ${
                value === category.id
                  ? "border-spark bg-spark/10"
                  : "border-warmwhite/10 hover:border-warmwhite/30 hover:bg-warmwhite/5"
              }`}
            >
              <span className="text-2xl mb-2">{category.emoji}</span>
              <span
                className={`font-medium text-sm ${
                  value === category.id ? "text-spark" : "text-warmwhite"
                }`}
              >
                {category.label}
              </span>
              <span className="text-warmwhite-muted text-xs mt-1 line-clamp-2">
                {category.description}
              </span>
            </button>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={800} duration={400}>
        <Button onClick={onNext} disabled={!value} fullWidth size="lg">
          Continue
        </Button>
      </FadeIn>
    </div>
  );
}
