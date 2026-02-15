"use client";

import { Button, OptionCard, FadeIn } from "@/components/ui";
import type { ExperienceLevel } from "@/types";

interface ExperienceProps {
  value: ExperienceLevel | null;
  onChange: (value: ExperienceLevel) => void;
  onNext: () => void;
  onBack: () => void;
}

const options: { id: ExperienceLevel; title: string; description: string }[] = [
  {
    id: "beginner",
    title: "Complete Beginner",
    description:
      "I've never started a business, nonprofit, or formal project before. This would be my first.",
  },
  {
    id: "some",
    title: "Some Experience",
    description:
      "I've dabbled in entrepreneurship or led projects, but nothing major took off yet.",
  },
  {
    id: "experienced",
    title: "Experienced Builder",
    description:
      "I've successfully launched ventures or led significant initiatives before.",
  },
];

export default function Experience({
  value,
  onChange,
  onNext,
  onBack,
}: ExperienceProps) {
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
          What&apos;s your experience level?
        </h2>
      </FadeIn>

      <FadeIn delay={200} duration={500}>
        <p className="text-warmwhite-muted text-lg mb-8">
          Be honest — there&apos;s no judgment here. This helps me calibrate
          advice to where you actually are, not where you think you should be.
        </p>
      </FadeIn>

      <div className="space-y-4 mb-8">
        {options.map((option, index) => (
          <FadeIn key={option.id} delay={300 + index * 100} duration={400}>
            <OptionCard
              title={option.title}
              description={option.description}
              selected={value === option.id}
              onClick={() => onChange(option.id)}
            />
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={600} duration={400}>
        <Button onClick={onNext} disabled={!value} fullWidth size="lg">
          Continue
        </Button>
      </FadeIn>
    </div>
  );
}
