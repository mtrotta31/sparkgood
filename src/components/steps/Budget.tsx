"use client";

import { Button, OptionCard, FadeIn } from "@/components/ui";
import type { BudgetLevel } from "@/types";

interface BudgetProps {
  value: BudgetLevel | null;
  onChange: (value: BudgetLevel) => void;
  onNext: () => void;
  onBack: () => void;
}

const options: {
  id: BudgetLevel;
  title: string;
  description: string;
  badge: string;
}[] = [
  {
    id: "zero",
    title: "Sweat Equity Only",
    description:
      "I have time and energy, but no money to invest right now. Looking for ideas that can start with $0.",
    badge: "$0",
  },
  {
    id: "low",
    title: "Bootstrap Budget",
    description:
      "I can invest a little to get started — enough for basic tools, a domain, maybe some initial supplies.",
    badge: "< $500",
  },
  {
    id: "medium",
    title: "Seed Budget",
    description:
      "I have some savings set aside for this. Enough to build something real, hire help, or run small tests.",
    badge: "$500 - $5K",
  },
  {
    id: "high",
    title: "Growth Budget",
    description:
      "I have significant capital to invest in doing this properly from day one.",
    badge: "$5K+",
  },
];

export default function Budget({
  value,
  onChange,
  onNext,
  onBack,
}: BudgetProps) {
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
          What&apos;s your starting budget?
        </h2>
      </FadeIn>

      <FadeIn delay={200} duration={500}>
        <p className="text-warmwhite-muted text-lg mb-8">
          Great impact doesn&apos;t require great wealth. I&apos;ll tailor ideas
          to what you can actually work with.
        </p>
      </FadeIn>

      <div className="space-y-4 mb-8">
        {options.map((option, index) => (
          <FadeIn key={option.id} delay={300 + index * 100} duration={400}>
            <div className="relative">
              <span className="absolute -top-2 right-4 bg-charcoal px-2 py-0.5 rounded text-xs font-medium text-spark border border-spark/30">
                {option.badge}
              </span>
              <OptionCard
                title={option.title}
                description={option.description}
                selected={value === option.id}
                onClick={() => onChange(option.id)}
              />
            </div>
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
