"use client";

import { Button, OptionCard, FadeIn } from "@/components/ui";
import type { Format as FormatValue } from "@/types";

interface FormatProps {
  value: FormatValue | null;
  onChange: (value: FormatValue) => void;
  onNext: () => void;
  onBack: () => void;
}

const options: { id: FormatValue; title: string; description: string }[] = [
  {
    id: "online",
    title: "Online / Digital",
    description:
      "Websites, apps, online communities, virtual services. Reach people anywhere in the world.",
  },
  {
    id: "in_person",
    title: "In-Person / Local",
    description:
      "Physical spaces, local events, face-to-face services. Deep roots in your community.",
  },
  {
    id: "both",
    title: "Both",
    description:
      "A hybrid approach — digital reach with local presence. Online tools supporting real-world action.",
  },
];

export default function Format({
  value,
  onChange,
  onNext,
  onBack,
}: FormatProps) {
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
          How do you see this working?
        </h2>
      </FadeIn>

      <FadeIn delay={200} duration={500}>
        <p className="text-warmwhite-muted text-lg mb-8">
          Would you rather build something online, create impact in-person in
          your community, or a mix of both?
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
