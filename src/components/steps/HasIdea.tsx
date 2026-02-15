"use client";

import { Button, OptionCard, FadeIn } from "@/components/ui";

interface HasIdeaProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

const options: { id: boolean; title: string; description: string }[] = [
  {
    id: true,
    title: "I Have an Idea",
    description:
      "I already know roughly what I want to create — I just need help refining and building it.",
  },
  {
    id: false,
    title: "Surprise Me",
    description:
      "I don't have a specific idea yet. Generate concepts based on my causes and situation.",
  },
];

export default function HasIdea({
  value,
  onChange,
  onNext,
  onBack,
}: HasIdeaProps) {
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
          One last question...
        </h2>
      </FadeIn>

      <FadeIn delay={200} duration={500}>
        <p className="text-warmwhite-muted text-lg mb-8">
          Do you already have a seed of an idea, or would you like me to
          generate fresh concepts based on everything you&apos;ve shared?
        </p>
      </FadeIn>

      <div className="space-y-4 mb-8">
        {options.map((option, index) => (
          <FadeIn key={String(option.id)} delay={300 + index * 100} duration={400}>
            <OptionCard
              title={option.title}
              description={option.description}
              selected={value === option.id}
              onClick={() => onChange(option.id)}
            />
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={500} duration={400}>
        <Button onClick={onNext} disabled={value === null} fullWidth size="lg">
          {value === true ? "Tell Me Your Idea" : value === false ? "Generate Ideas" : "Continue"}
        </Button>
      </FadeIn>
    </div>
  );
}
