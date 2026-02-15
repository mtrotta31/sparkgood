"use client";

import { useState } from "react";
import { Button, FadeIn } from "@/components/ui";
import type { Idea } from "@/types";

interface IdeaCardProps {
  idea: Idea & { mechanism?: string; whyNow?: string; firstStep?: string };
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onContinue?: () => void;
  showDetails?: boolean;
}

export default function IdeaCard({
  idea,
  index,
  isSelected,
  onSelect,
  onContinue,
  showDetails = false,
}: IdeaCardProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);

  return (
    <FadeIn delay={index * 150} duration={500}>
      <div
        className={`
          relative rounded-2xl border-2 transition-all duration-300 overflow-hidden
          ${
            isSelected
              ? "border-spark bg-spark/5 shadow-xl shadow-spark/10"
              : "border-warmwhite/10 hover:border-warmwhite/20 bg-charcoal-light"
          }
        `}
      >
        {/* Card Header */}
        <div className="p-6 pb-4">
          {/* Idea Number Badge */}
          <div className="flex items-start justify-between mb-4">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${
                  isSelected
                    ? "bg-spark text-charcoal-dark"
                    : "bg-warmwhite/10 text-warmwhite-muted"
                }
              `}
            >
              {index + 1}
            </div>
            {isSelected && (
              <span className="text-xs font-medium text-spark bg-spark/10 px-3 py-1 rounded-full">
                Selected
              </span>
            )}
          </div>

          {/* Idea Name & Tagline */}
          <h3 className="font-display text-xl md:text-2xl font-bold text-warmwhite mb-2">
            {idea.name}
          </h3>
          <p className="text-spark font-medium mb-4">{idea.tagline}</p>

          {/* Problem & Audience Preview */}
          <div className="space-y-3 mb-4">
            <div>
              <span className="text-warmwhite-dim text-xs uppercase tracking-wider">
                The Problem
              </span>
              <p className={`text-warmwhite-muted text-sm mt-1 ${isExpanded ? "" : "line-clamp-2"}`}>
                {idea.problem}
              </p>
            </div>
            <div>
              <span className="text-warmwhite-dim text-xs uppercase tracking-wider">
                Who It Serves
              </span>
              <p className={`text-warmwhite-muted text-sm mt-1 ${isExpanded ? "" : "line-clamp-2"}`}>
                {idea.audience}
              </p>
            </div>
          </div>

          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-spark hover:text-spark-400 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            {isExpanded ? "Show less" : "Show more"}
            <svg
              className={`w-4 h-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="px-6 pb-6 pt-2 border-t border-warmwhite/5 space-y-4">
            {idea.mechanism && (
              <div>
                <span className="text-warmwhite-dim text-xs uppercase tracking-wider">
                  How It Works
                </span>
                <p className="text-warmwhite-muted text-sm mt-1">
                  {idea.mechanism}
                </p>
              </div>
            )}

            {idea.revenueModel && (
              <div>
                <span className="text-warmwhite-dim text-xs uppercase tracking-wider">
                  Sustainability Model
                </span>
                <p className="text-warmwhite-muted text-sm mt-1">
                  {idea.revenueModel}
                </p>
              </div>
            )}

            <div>
              <span className="text-warmwhite-dim text-xs uppercase tracking-wider">
                The Impact
              </span>
              <p className="text-warmwhite-muted text-sm mt-1">{idea.impact}</p>
            </div>

            {idea.whyNow && (
              <div>
                <span className="text-warmwhite-dim text-xs uppercase tracking-wider">
                  Why Now
                </span>
                <p className="text-warmwhite-muted text-sm mt-1">
                  {idea.whyNow}
                </p>
              </div>
            )}

            {idea.firstStep && (
              <div className="bg-spark/10 rounded-xl p-4 mt-4">
                <span className="text-spark text-xs uppercase tracking-wider font-medium">
                  First Step This Week
                </span>
                <p className="text-warmwhite text-sm mt-1 font-medium">
                  {idea.firstStep}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Select Button */}
        <div className="px-6 pb-6">
          <Button
            variant={isSelected ? "primary" : "secondary"}
            fullWidth
            onClick={isSelected && onContinue ? onContinue : onSelect}
          >
            {isSelected ? "Continue to Deep Dive →" : "Choose This Idea"}
          </Button>
        </div>
      </div>
    </FadeIn>
  );
}
