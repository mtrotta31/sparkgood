"use client";

import { Button, FadeIn } from "@/components/ui";
import { KEY_SKILLS } from "@/lib/constants";
import type { KeySkill } from "@/types";

interface KeySkillsProps {
  value: KeySkill[];
  onChange: (value: KeySkill[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const MAX_SKILLS = 5;

export default function KeySkills({
  value,
  onChange,
  onNext,
  onBack,
}: KeySkillsProps) {
  const toggleSkill = (skillId: KeySkill) => {
    if (value.includes(skillId)) {
      onChange(value.filter((s) => s !== skillId));
    } else if (value.length < MAX_SKILLS) {
      onChange([...value, skillId]);
    }
  };

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
          What skills do you bring?
        </h2>
      </FadeIn>

      <FadeIn delay={200} duration={500}>
        <p className="text-warmwhite-muted text-lg mb-2">
          Select up to {MAX_SKILLS} skills that you&apos;re strong in. We&apos;ll
          suggest ideas that play to your strengths.
        </p>
        <p className="text-warmwhite-muted/70 text-sm mb-8">
          {value.length} of {MAX_SKILLS} selected
        </p>
      </FadeIn>

      <div className="flex flex-wrap gap-3 mb-8">
        {KEY_SKILLS.map((skill, index) => {
          const isSelected = value.includes(skill.id);
          const isDisabled = !isSelected && value.length >= MAX_SKILLS;

          return (
            <FadeIn key={skill.id} delay={300 + index * 50} duration={400}>
              <button
                onClick={() => toggleSkill(skill.id)}
                disabled={isDisabled}
                className={`px-4 py-2 rounded-full border-2 transition-all ${
                  isSelected
                    ? "border-spark bg-spark/10 text-spark"
                    : isDisabled
                    ? "border-warmwhite/5 text-warmwhite/30 cursor-not-allowed"
                    : "border-warmwhite/20 text-warmwhite hover:border-warmwhite/40 hover:bg-warmwhite/5"
                }`}
                title={skill.description}
              >
                {skill.label}
              </button>
            </FadeIn>
          );
        })}
      </div>

      <FadeIn delay={700} duration={400}>
        <Button
          onClick={onNext}
          disabled={value.length === 0}
          fullWidth
          size="lg"
        >
          Continue
        </Button>
      </FadeIn>
    </div>
  );
}
