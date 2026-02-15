"use client";

import { Button, CauseTag, FadeIn } from "@/components/ui";
import { CAUSE_AREAS } from "@/lib/constants";
import type { CauseArea } from "@/types";

interface CauseSelectProps {
  value: CauseArea[];
  onChange: (value: CauseArea[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CauseSelect({
  value,
  onChange,
  onNext,
  onBack,
}: CauseSelectProps) {
  const toggleCause = (cause: CauseArea) => {
    if (value.includes(cause)) {
      onChange(value.filter((c) => c !== cause));
    } else if (value.length < 3) {
      onChange([...value, cause]);
    }
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
          What causes light you up?
        </h2>
      </FadeIn>

      <FadeIn delay={200} duration={500}>
        <p className="text-warmwhite-muted text-lg mb-2">
          Select up to 3 that matter most to you. These will shape the ideas we
          generate.
        </p>
        <p className="text-warmwhite-dim text-sm mb-8">
          {value.length}/3 selected
        </p>
      </FadeIn>

      <FadeIn delay={300} duration={500}>
        <div className="flex flex-wrap gap-3 mb-8">
          {CAUSE_AREAS.map((cause) => (
            <CauseTag
              key={cause.id}
              label={cause.label}
              emoji={cause.emoji}
              selected={value.includes(cause.id)}
              onClick={() => toggleCause(cause.id)}
              disabled={!value.includes(cause.id) && value.length >= 3}
            />
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={500} duration={400}>
        <Button
          onClick={onNext}
          disabled={value.length === 0}
          fullWidth
          size="lg"
        >
          Continue
        </Button>
      </FadeIn>
    </div>
  );
}
