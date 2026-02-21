"use client";

import { Button, OptionCard, FadeIn } from "@/components/ui";
import { BUSINESS_MODELS } from "@/lib/constants";
import type { BusinessModelPreference } from "@/types";

interface BusinessModelProps {
  value: BusinessModelPreference | null;
  onChange: (value: BusinessModelPreference) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BusinessModel({
  value,
  onChange,
  onNext,
  onBack,
}: BusinessModelProps) {
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
          What type of business model interests you?
        </h2>
      </FadeIn>

      <FadeIn delay={200} duration={500}>
        <p className="text-warmwhite-muted text-lg mb-8">
          How do you want to make money? Pick the model that feels most natural
          to you.
        </p>
      </FadeIn>

      <div className="space-y-4 mb-8">
        {BUSINESS_MODELS.map((model, index) => (
          <FadeIn key={model.id} delay={300 + index * 100} duration={400}>
            <OptionCard
              title={model.label}
              description={model.description}
              selected={value === model.id}
              onClick={() => onChange(model.id)}
            />
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={700} duration={400}>
        <Button onClick={onNext} disabled={!value} fullWidth size="lg">
          Continue
        </Button>
      </FadeIn>
    </div>
  );
}
