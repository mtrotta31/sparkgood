"use client";

import Link from "next/link";
import { FadeIn } from "@/components/ui";
import type { Idea, CauseArea } from "@/types";

// Cause area display config
const causeLabels: Record<CauseArea, string> = {
  environment: "Environment",
  education: "Education",
  health: "Health",
  poverty: "Poverty",
  food_security: "Food Security",
  equity: "Equity",
  animals: "Animals",
  mental_health: "Mental Health",
  youth: "Youth",
  elder_care: "Elder Care",
  arts: "Arts",
  tech_access: "Tech Access",
};

const commitmentLabels: Record<string, string> = {
  weekend: "Weekend Warrior",
  steady: "Steady Builder",
  all_in: "All In",
};

interface DeepDiveStatus {
  hasViability: boolean;
  hasPlan: boolean;
  hasMarketing: boolean;
  hasRoadmap: boolean;
}

interface ProjectCardProps {
  id: string;
  idea: Idea;
  commitment: string | null;
  createdAt: string;
  updatedAt: string;
  deepDiveStatus: DeepDiveStatus;
  index: number;
}

export default function ProjectCard({
  id,
  idea,
  commitment,
  createdAt,
  updatedAt: _updatedAt,
  deepDiveStatus,
  index,
}: ProjectCardProps) {
  // Calculate completion percentage
  const completedTabs = [
    deepDiveStatus.hasViability,
    deepDiveStatus.hasPlan,
    deepDiveStatus.hasMarketing,
    deepDiveStatus.hasRoadmap,
  ].filter(Boolean).length;
  const completionPercent = Math.round((completedTabs / 4) * 100);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get primary cause area
  const primaryCause = idea.causeAreas?.[0];

  return (
    <FadeIn delay={index * 100} duration={400}>
      <Link href={`/projects/${id}`}>
        <div className="group relative bg-charcoal-light border border-warmwhite/10 rounded-2xl p-6 hover:border-spark/30 hover:bg-charcoal-light/80 transition-all duration-300 cursor-pointer">
          {/* Progress indicator */}
          <div className="absolute top-4 right-4">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-warmwhite/10"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${completionPercent * 0.88} 88`}
                  strokeLinecap="round"
                  className="text-spark"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-warmwhite-muted">
                {completionPercent}%
              </span>
            </div>
          </div>

          {/* Cause tag */}
          {primaryCause && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-spark/10 text-spark text-xs font-medium mb-3">
              {causeLabels[primaryCause] || primaryCause}
            </div>
          )}

          {/* Idea name and tagline */}
          <h3 className="font-display text-xl font-bold text-warmwhite mb-2 group-hover:text-spark transition-colors line-clamp-1">
            {idea.name}
          </h3>
          <p className="text-warmwhite-muted text-sm mb-4 line-clamp-2">
            {idea.tagline}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-warmwhite-dim">
            {commitment && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {commitmentLabels[commitment] || commitment}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(createdAt)}
            </span>
          </div>

          {/* Deep dive status indicators */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-warmwhite/5">
            <StatusDot filled={deepDiveStatus.hasViability} label="Viability" />
            <StatusDot filled={deepDiveStatus.hasPlan} label="Plan" />
            <StatusDot filled={deepDiveStatus.hasMarketing} label="Marketing" />
            <StatusDot filled={deepDiveStatus.hasRoadmap} label="Roadmap" />
          </div>
        </div>
      </Link>
    </FadeIn>
  );
}

function StatusDot({ filled, label }: { filled: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 group/dot">
      <div
        className={`w-2 h-2 rounded-full ${
          filled ? "bg-spark" : "bg-warmwhite/20"
        }`}
      />
      <span className="text-xs text-warmwhite-dim opacity-0 group-hover/dot:opacity-100 transition-opacity">
        {label}
      </span>
    </div>
  );
}
