"use client";

import { Button, FadeIn } from "@/components/ui";
import IdeaCard from "./IdeaCard";
import type { Idea } from "@/types";

interface IdeaListProps {
  ideas: (Idea & { mechanism?: string; whyNow?: string; firstStep?: string })[];
  onSelectIdea: (idea: Idea) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
  selectedIdea: Idea | null;
  onContinue: () => void;
}

export default function IdeaList({
  ideas,
  onSelectIdea,
  onRegenerate,
  isRegenerating = false,
  selectedIdea,
  onContinue,
}: IdeaListProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <FadeIn duration={500}>
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">✦</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-warmwhite mb-4">
            Here are your ideas
          </h1>
          <p className="text-warmwhite-muted text-lg max-w-xl mx-auto">
            Based on what you shared, I&apos;ve crafted 4 unique social impact
            concepts. Explore each one and choose the one that resonates most.
          </p>
        </div>
      </FadeIn>

      {/* Ideas Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {ideas.map((idea, index) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            index={index}
            isSelected={selectedIdea?.id === idea.id}
            onSelect={() => onSelectIdea(idea)}
            onContinue={onContinue}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <FadeIn delay={600} duration={500}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Button
            variant="ghost"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-2"
          >
            <svg
              className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isRegenerating ? "Generating..." : "Generate New Ideas"}
          </Button>

          {selectedIdea && (
            <Button size="lg" onClick={onContinue}>
              Continue with &quot;{selectedIdea.name}&quot;
            </Button>
          )}
        </div>
      </FadeIn>

      {/* Help Text */}
      <FadeIn delay={800} duration={500}>
        <p className="text-center text-warmwhite-dim text-sm mt-8">
          Not quite right?{" "}
          <button
            onClick={onRegenerate}
            className="text-spark hover:underline"
            disabled={isRegenerating}
          >
            Regenerate
          </button>{" "}
          for fresh concepts, or select an idea to refine it in the next step.
        </p>
      </FadeIn>
    </div>
  );
}
