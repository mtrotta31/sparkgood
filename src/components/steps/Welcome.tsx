"use client";

import { Button, FadeIn } from "@/components/ui";

interface WelcomeProps {
  onNext: () => void;
}

export default function Welcome({ onNext }: WelcomeProps) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-8">
      <FadeIn delay={0} duration={600}>
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center mb-6 md:mb-8 mx-auto shadow-lg shadow-spark/20">
          <span className="text-2xl md:text-3xl">✦</span>
        </div>
      </FadeIn>

      <FadeIn delay={200} duration={600}>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-warmwhite mb-4 md:mb-6 tracking-tight max-w-3xl leading-tight">
          Let&apos;s spark something{" "}
          <span className="text-spark-gradient">good</span> together.
        </h1>
      </FadeIn>

      <FadeIn delay={400} duration={600}>
        <p className="text-lg md:text-xl text-warmwhite-muted max-w-xl mb-3 md:mb-4 leading-relaxed">
          You want to make a difference in the world. That&apos;s the hardest
          part — the caring. Now let&apos;s turn that into action.
        </p>
      </FadeIn>

      <FadeIn delay={500} duration={600}>
        <p className="text-sm md:text-base text-warmwhite-dim mb-8 md:mb-12 max-w-lg">
          I&apos;ll ask you a few questions to understand what matters to you,
          then help you find the perfect way to create real impact.
        </p>
      </FadeIn>

      <FadeIn delay={700} duration={600}>
        <Button size="lg" onClick={onNext}>
          Let&apos;s Begin
        </Button>
      </FadeIn>

      <FadeIn delay={900} duration={600}>
        <p className="mt-6 md:mt-8 text-warmwhite-dim text-xs md:text-sm">
          Takes about 5 minutes • Free to start
        </p>
      </FadeIn>
    </div>
  );
}
