"use client";

import { useState } from "react";
import { Button, FadeIn } from "@/components/ui";

interface OwnIdeaProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function OwnIdea({
  value,
  onChange,
  onNext,
  onBack,
}: OwnIdeaProps) {
  const [charCount, setCharCount] = useState(value.length);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 500) {
      onChange(text);
      setCharCount(text.length);
    }
  };

  const isValid = value.trim().length >= 20;

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
          Tell me about your idea.
        </h2>
      </FadeIn>

      <FadeIn delay={200} duration={500}>
        <p className="text-warmwhite-muted text-lg mb-8">
          Don&apos;t worry about making it perfect. Just describe what
          you&apos;re imagining — the problem you want to solve, who you want to
          help, or any rough concept. I&apos;ll help shape it.
        </p>
      </FadeIn>

      <FadeIn delay={300} duration={500}>
        <div className="relative mb-6">
          <textarea
            value={value}
            onChange={handleChange}
            placeholder="E.g., I want to help elderly people in my neighborhood who are isolated and lonely. Maybe some kind of visiting program or social events..."
            className="w-full h-40 p-4 rounded-xl bg-charcoal-light border-2 border-warmwhite/10 text-warmwhite placeholder-warmwhite-dim resize-none focus:border-spark focus:outline-none transition-colors"
          />
          <div className="absolute bottom-3 right-3 text-sm text-warmwhite-dim">
            {charCount}/500
          </div>
        </div>
      </FadeIn>

      {value.trim().length > 0 && value.trim().length < 20 && (
        <FadeIn delay={0} duration={300}>
          <p className="text-warmwhite-dim text-sm mb-4">
            Tell me a bit more — at least 20 characters helps me understand your
            vision.
          </p>
        </FadeIn>
      )}

      <FadeIn delay={400} duration={400}>
        <Button onClick={onNext} disabled={!isValid} fullWidth size="lg">
          Generate Ideas Based on This
        </Button>
      </FadeIn>

      <FadeIn delay={500} duration={400}>
        <button
          onClick={onBack}
          className="w-full mt-4 text-warmwhite-muted hover:text-warmwhite text-sm transition-colors"
        >
          Actually, surprise me with fresh ideas instead
        </button>
      </FadeIn>
    </div>
  );
}
