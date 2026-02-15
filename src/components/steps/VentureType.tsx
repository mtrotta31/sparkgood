"use client";

import { Button, OptionCard, FadeIn } from "@/components/ui";
import type { VentureType as VentureTypeValue } from "@/types";

interface VentureTypeProps {
  value: VentureTypeValue | null;
  onChange: (value: VentureTypeValue) => void;
  onNext: () => void;
  onBack: () => void;
}

const options: { id: VentureTypeValue; title: string; description: string }[] =
  [
    {
      id: "project",
      title: "Community Project",
      description:
        "Organize something meaningful in your community — a cleanup, tutoring program, support group. No business required.",
    },
    {
      id: "nonprofit",
      title: "Nonprofit Organization",
      description:
        "A formal organization focused on impact over profit. Think charities, foundations, advocacy groups.",
    },
    {
      id: "business",
      title: "Social Business",
      description:
        "A company that makes money AND makes a difference. Profit with purpose.",
    },
    {
      id: "hybrid",
      title: "Hybrid Model",
      description:
        "Combine nonprofit mission with business revenue streams. The best of both worlds.",
    },
  ];

export default function VentureType({
  value,
  onChange,
  onNext,
  onBack,
}: VentureTypeProps) {
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
          What kind of venture are you imagining?
        </h2>
      </FadeIn>

      <FadeIn delay={200} duration={500}>
        <p className="text-warmwhite-muted text-lg mb-8">
          There&apos;s no wrong answer. Pick whatever feels closest to what
          you&apos;re drawn to — we can always adjust.
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

      <FadeIn delay={700} duration={400}>
        <Button onClick={onNext} disabled={!value} fullWidth size="lg">
          Continue
        </Button>
      </FadeIn>
    </div>
  );
}
