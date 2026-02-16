"use client";

import { useState, useEffect, useCallback } from "react";
import { FadeIn } from "@/components/ui";
import ViabilityReport from "./ViabilityReport";
import BusinessPlanView from "./BusinessPlanView";
import MarketingAssetsView from "./MarketingAssetsView";
import ActionRoadmapView from "./ActionRoadmapView";
import type {
  Idea,
  UserProfile,
  ViabilityReport as ViabilityReportType,
  BusinessPlan,
  MarketingAssets,
  ActionRoadmap,
} from "@/types";

type TabId = "viability" | "plan" | "marketing" | "roadmap";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: "viability",
    label: "Will This Work?",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    id: "plan",
    label: "Your Game Plan",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: "marketing",
    label: "Spread the Word",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
      </svg>
    ),
  },
  {
    id: "roadmap",
    label: "Start Here",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
];

interface DeepDiveSectionProps {
  idea: Idea;
  profile: UserProfile;
  onBack: () => void;
}

export default function DeepDiveSection({ idea, profile, onBack }: DeepDiveSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>("viability");
  const [loadingTab, setLoadingTab] = useState<TabId | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Content state for each section
  const [viability, setViability] = useState<ViabilityReportType | null>(null);
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [marketing, setMarketing] = useState<MarketingAssets | null>(null);
  const [roadmap, setRoadmap] = useState<ActionRoadmap | null>(null);

  // Fetch content for a specific tab
  const fetchContent = useCallback(async (tabId: TabId) => {
    // Check if we already have the content
    if (
      (tabId === "viability" && viability) ||
      (tabId === "plan" && plan) ||
      (tabId === "marketing" && marketing) ||
      (tabId === "roadmap" && roadmap)
    ) {
      return;
    }

    setLoadingTab(tabId);
    setError(null);

    try {
      const response = await fetch("/api/deep-dive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          profile,
          section: tabId,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        switch (tabId) {
          case "viability":
            setViability(result.data as ViabilityReportType);
            break;
          case "plan":
            setPlan(result.data as BusinessPlan);
            break;
          case "marketing":
            setMarketing(result.data as MarketingAssets);
            break;
          case "roadmap":
            setRoadmap(result.data as ActionRoadmap);
            break;
        }
      } else {
        setError(result.error || "Failed to load content");
      }
    } catch (err) {
      console.error("Error fetching deep dive content:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoadingTab(null);
    }
  }, [idea, profile, viability, plan, marketing, roadmap]);

  // Fetch content when tab changes
  useEffect(() => {
    fetchContent(activeTab);
  }, [activeTab, fetchContent]);

  // Get content for current tab
  const getCurrentContent = () => {
    switch (activeTab) {
      case "viability":
        return viability;
      case "plan":
        return plan;
      case "marketing":
        return marketing;
      case "roadmap":
        return roadmap;
    }
  };

  const isLoading = loadingTab === activeTab;
  const content = getCurrentContent();

  return (
    <div className="min-h-screen bg-charcoal-dark">
      {/* Header */}
      <div className="border-b border-warmwhite/10 bg-charcoal-dark/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 md:py-4">
          {/* Top bar with logo and back */}
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-3 md:gap-4">
              {/* Logo link home */}
              <a href="/" className="flex items-center gap-2 group">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center transition-transform group-hover:scale-105">
                  <span className="text-xs md:text-sm">✦</span>
                </div>
                <span className="font-display text-warmwhite font-semibold hidden sm:inline text-sm">
                  SparkGood
                </span>
              </a>

              {/* Divider */}
              <div className="w-px h-5 bg-warmwhite/20 hidden sm:block" />

              {/* Back to ideas */}
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-warmwhite-muted hover:text-warmwhite transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back to Ideas</span>
              </button>
            </div>

            <span className="text-xs font-medium text-spark bg-spark/10 px-2 md:px-3 py-1 rounded-full">
              Premium
            </span>
          </div>

          {/* Idea title */}
          <FadeIn duration={400}>
            <div className="mb-4 md:mb-6">
              <h1 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-warmwhite leading-tight">
                {idea.name}
              </h1>
              <p className="text-warmwhite-muted mt-1 text-sm md:text-base line-clamp-1 md:line-clamp-none">{idea.tagline}</p>
            </div>
          </FadeIn>

          {/* Tabs - horizontal scroll on mobile */}
          <div className="flex gap-1 overflow-x-auto pb-1 -mb-px scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-t-lg font-medium text-xs md:text-sm whitespace-nowrap
                  transition-all duration-200 flex-shrink-0
                  ${activeTab === tab.id
                    ? "bg-charcoal-light text-spark border-b-2 border-spark"
                    : "text-warmwhite-muted hover:text-warmwhite hover:bg-charcoal-light/50"
                  }
                `}
              >
                <span className="hidden sm:inline">{tab.icon}</span>
                {tab.label}
                {loadingTab === tab.id && (
                  <svg className="w-3 h-3 md:w-4 md:h-4 animate-spin ml-1" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        {error && (
          <FadeIn duration={300}>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-warmwhite mb-1">Error loading content</h3>
                  <p className="text-warmwhite-muted text-sm">{error}</p>
                  <button
                    onClick={() => fetchContent(activeTab)}
                    className="mt-3 text-spark hover:text-spark-400 text-sm font-medium"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {isLoading && !content && (
          <FadeIn duration={300}>
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-charcoal-light" />
                <svg className="absolute inset-0 w-16 h-16 -rotate-90 animate-spin">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="url(#spinGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="60 200"
                  />
                  <defs>
                    <linearGradient id="spinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#F97316" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <p className="text-warmwhite font-medium mb-2">
                Researching your idea...
              </p>
              <p className="text-warmwhite-muted text-sm text-center max-w-md">
                We're searching real market data and analyzing competitors. This takes 15-20 seconds because we're pulling live information.
              </p>
            </div>
          </FadeIn>
        )}

        {content && !isLoading && (
          <FadeIn duration={400}>
            {activeTab === "viability" && viability && (
              <ViabilityReport report={viability} />
            )}
            {activeTab === "plan" && plan && (
              <BusinessPlanView plan={plan} profile={profile} />
            )}
            {activeTab === "marketing" && marketing && (
              <MarketingAssetsView assets={marketing} ideaName={idea.name} />
            )}
            {activeTab === "roadmap" && roadmap && (
              <ActionRoadmapView roadmap={roadmap} />
            )}
          </FadeIn>
        )}
      </div>
    </div>
  );
}
