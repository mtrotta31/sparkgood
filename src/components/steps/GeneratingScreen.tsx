"use client";

import { useEffect, useState } from "react";
import { FadeIn } from "@/components/ui";

interface GeneratingScreenProps {
  onComplete?: () => void;
}

const loadingMessages = [
  "Analyzing your causes and preferences...",
  "Searching for market opportunities...",
  "Finding gaps where you can make impact...",
  "Crafting unique venture concepts...",
  "Tailoring ideas to your experience level...",
  "Almost there...",
];

export default function GeneratingScreen({
  onComplete,
}: GeneratingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle through messages
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    // Animate progress - if onComplete provided, complete at 100%
    // Otherwise, pulse between 70-95% to show ongoing activity
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (onComplete) {
          // Original behavior: complete and callback
          if (prev >= 100) {
            clearInterval(progressInterval);
            clearInterval(messageInterval);
            setTimeout(onComplete, 500);
            return 100;
          }
          return prev + 2;
        } else {
          // New behavior: pulse between 70-95% indefinitely
          if (prev >= 95) return 70;
          return prev + 0.5;
        }
      });
    }, 100);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <FadeIn duration={600}>
        <div className="relative w-24 h-24 mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-charcoal-light" />
          {/* Progress ring */}
          <svg className="absolute inset-0 w-24 h-24 -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="url(#sparkGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.76} 276`}
              className="transition-all duration-200"
            />
            <defs>
              <linearGradient
                id="sparkGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center spark */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl animate-pulse">✦</span>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={200} duration={600}>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-warmwhite mb-4">
          Sparking ideas for you...
        </h2>
      </FadeIn>

      <div className="h-8">
        <FadeIn key={messageIndex} duration={300}>
          <p className="text-warmwhite-muted">{loadingMessages[messageIndex]}</p>
        </FadeIn>
      </div>

      <FadeIn delay={400} duration={600}>
        <div className="w-64 h-1.5 bg-charcoal-light rounded-full overflow-hidden mt-8">
          <div
            className="h-full bg-gradient-to-r from-spark to-accent rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </FadeIn>
    </div>
  );
}
