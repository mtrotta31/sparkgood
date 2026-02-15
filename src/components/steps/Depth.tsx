"use client";

import { Button, OptionCard, FadeIn } from "@/components/ui";
import type { Depth as DepthValue } from "@/types";

interface DepthProps {
  value: DepthValue | null;
  onChange: (value: DepthValue) => void;
  onNext: () => void;
  onBack: () => void;
}

const options: { id: DepthValue; title: string; description: string }[] = [
  {
    id: "ideas",
    title: "Just Give Me Ideas",
    description:
      "I want to explore possibilities first. Show me 4 social impact concepts I could pursue, and I'll take it from there.",
  },
  {
    id: "full",
    title: "Help Me Build It",
    description:
      "I'm ready to go deeper. After ideas, help me with market research, a business plan, marketing assets, and an action roadmap.",
  },
];

export default function Depth({
  value,
  onChange,
  onNext,
  onBack,
}: DepthProps) {
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
          How deep do you want to go?
        </h2>
      </FadeIn>

      <FadeIn delay={200} duration={500}>
        <p className="text-warmwhite-muted text-lg mb-8">
          You can always come back for more. But if you&apos;re serious about
          making this happen, the full journey will give you everything you need
          to launch.
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

      {value === "full" && (
        <FadeIn delay={500} duration={400}>
          <div className="bg-spark/10 border border-spark/30 rounded-xl p-4 mb-6">
            <p className="text-spark text-sm font-medium mb-1">
              Full journey includes:
            </p>
            <p className="text-warmwhite-muted text-sm">
              Market research • Business/project plan • Marketing assets •
              Action roadmap
            </p>
          </div>
        </FadeIn>
      )}

      <FadeIn delay={600} duration={400}>
        <Button onClick={onNext} disabled={!value} fullWidth size="lg">
          Continue
        </Button>
      </FadeIn>
    </div>
  );
}
