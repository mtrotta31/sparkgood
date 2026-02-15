"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ProgressBar, Header } from "@/components/ui";
import {
  Welcome,
  VentureType,
  Format,
  CauseSelect,
  Experience,
  Budget,
  Commitment,
  Depth,
  HasIdea,
  OwnIdea,
  GeneratingScreen,
} from "@/components/steps";
import { IdeaList } from "@/components/results";
import { DeepDiveSection } from "@/components/deep-dive";
import { STEP_PROGRESS } from "@/lib/constants";
import type {
  UserProfile,
  VentureType as VentureTypeValue,
  Format as FormatValue,
  ExperienceLevel,
  BudgetLevel,
  CommitmentLevel,
  Depth as DepthValue,
  CauseArea,
  StepName,
  Idea,
} from "@/types";

// Initial user profile state
const initialProfile: UserProfile = {
  ventureType: null,
  format: null,
  causes: [],
  experience: null,
  budget: null,
  commitment: null,
  depth: null,
  hasIdea: null,
  ownIdea: "",
};

// Extended Idea type with additional fields from generation
type ExtendedIdea = Idea & { mechanism?: string; whyNow?: string; firstStep?: string };

export default function BuilderPage() {
  const [currentStep, setCurrentStep] = useState<StepName>("welcome");
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Ideas state
  const [ideas, setIdeas] = useState<ExtendedIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<ExtendedIdea | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const hasStartedGenerating = useRef(false);

  // Progress calculation
  const progress = STEP_PROGRESS[currentStep] || 0;

  // Step transition handler with smooth animation
  const goToStep = useCallback((step: StepName) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsTransitioning(false);
      // Scroll to top on step change
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 150);
  }, []);

  // Update profile helpers
  const updateProfile = useCallback(
    <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
      setProfile((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Generate ideas from API
  const generateIdeas = useCallback(async () => {
    setGenerationError(null);
    try {
      const response = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setIdeas(result.data);
        setSelectedIdea(null);
        return true;
      } else {
        setGenerationError(result.error || "Failed to generate ideas");
        return false;
      }
    } catch (error) {
      console.error("Error generating ideas:", error);
      setGenerationError("Something went wrong. Please try again.");
      return false;
    }
  }, [profile]);

  // Regenerate ideas
  const handleRegenerate = useCallback(async () => {
    setIsRegenerating(true);
    await generateIdeas();
    setIsRegenerating(false);
  }, [generateIdeas]);

  // Handle idea selection
  const handleSelectIdea = useCallback((idea: ExtendedIdea) => {
    setSelectedIdea(idea);
  }, []);

  // Generate ideas when entering the generating step
  useEffect(() => {
    if (currentStep === "generating" && !hasStartedGenerating.current) {
      hasStartedGenerating.current = true;
      generateIdeas().then((success) => {
        if (success) {
          // Wait a bit for the animation to feel complete, then show ideas
          setTimeout(() => {
            goToStep("ideas");
          }, 2000);
        } else {
          // On error, still go to ideas step to show the error
          setTimeout(() => {
            goToStep("ideas");
          }, 1000);
        }
      });
    }
  }, [currentStep, generateIdeas, goToStep]);

  // Reset generation flag when going back from ideas
  useEffect(() => {
    if (currentStep !== "generating" && currentStep !== "ideas") {
      hasStartedGenerating.current = false;
    }
  }, [currentStep]);

  
  // Step navigation logic
  const getNextStep = (current: StepName): StepName => {
    const stepOrder: StepName[] = [
      "welcome",
      "venture_type",
      "format",
      "causes",
      "experience",
      "budget",
      "commitment",
      "depth",
      "has_idea",
    ];

    const currentIndex = stepOrder.indexOf(current);
    if (currentIndex === -1) return "welcome";

    // Special case: after has_idea, either go to own_idea or generating
    if (current === "has_idea") {
      return profile.hasIdea ? "own_idea" : "generating";
    }

    // Special case: after own_idea, go to generating
    if (current === "own_idea") {
      return "generating";
    }

    return stepOrder[currentIndex + 1] || "ideas";
  };

  const getPrevStep = (current: StepName): StepName => {
    const stepOrder: StepName[] = [
      "welcome",
      "venture_type",
      "format",
      "causes",
      "experience",
      "budget",
      "commitment",
      "depth",
      "has_idea",
    ];

    const currentIndex = stepOrder.indexOf(current);

    // Special case: from own_idea, go back to has_idea
    if (current === "own_idea") {
      return "has_idea";
    }

    if (currentIndex <= 0) return "welcome";
    return stepOrder[currentIndex - 1];
  };

  // Render current step
  const renderStep = () => {
    const stepProps = {
      onNext: () => goToStep(getNextStep(currentStep)),
      onBack: () => goToStep(getPrevStep(currentStep)),
    };

    switch (currentStep) {
      case "welcome":
        return <Welcome onNext={() => goToStep("venture_type")} />;

      case "venture_type":
        return (
          <VentureType
            value={profile.ventureType}
            onChange={(v: VentureTypeValue) => updateProfile("ventureType", v)}
            {...stepProps}
          />
        );

      case "format":
        return (
          <Format
            value={profile.format}
            onChange={(v: FormatValue) => updateProfile("format", v)}
            {...stepProps}
          />
        );

      case "causes":
        return (
          <CauseSelect
            value={profile.causes}
            onChange={(v: CauseArea[]) => updateProfile("causes", v)}
            {...stepProps}
          />
        );

      case "experience":
        return (
          <Experience
            value={profile.experience}
            onChange={(v: ExperienceLevel) => updateProfile("experience", v)}
            {...stepProps}
          />
        );

      case "budget":
        return (
          <Budget
            value={profile.budget}
            onChange={(v: BudgetLevel) => updateProfile("budget", v)}
            {...stepProps}
          />
        );

      case "commitment":
        return (
          <Commitment
            value={profile.commitment}
            onChange={(v: CommitmentLevel) => updateProfile("commitment", v)}
            {...stepProps}
          />
        );

      case "depth":
        return (
          <Depth
            value={profile.depth}
            onChange={(v: DepthValue) => updateProfile("depth", v)}
            {...stepProps}
          />
        );

      case "has_idea":
        return (
          <HasIdea
            value={profile.hasIdea}
            onChange={(v: boolean) => updateProfile("hasIdea", v)}
            {...stepProps}
          />
        );

      case "own_idea":
        return (
          <OwnIdea
            value={profile.ownIdea}
            onChange={(v: string) => updateProfile("ownIdea", v)}
            onNext={() => goToStep("generating")}
            onBack={() => {
              // If going back, reset hasIdea so they can choose again
              updateProfile("hasIdea", null);
              goToStep("has_idea");
            }}
          />
        );

      case "generating":
        // onComplete is called by useEffect after API returns
        return <GeneratingScreen />;

      case "ideas":
        // Show error if generation failed
        if (generationError && ideas.length === 0) {
          return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="font-display text-3xl font-bold text-warmwhite mb-4">
                Something went wrong
              </h2>
              <p className="text-warmwhite-muted mb-8">
                {generationError}
              </p>
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="inline-flex items-center gap-2 px-6 py-3 bg-spark text-charcoal-dark font-medium rounded-full hover:bg-spark-400 transition-colors disabled:opacity-50"
              >
                {isRegenerating ? "Trying again..." : "Try Again"}
              </button>
            </div>
          );
        }

        // Show ideas list
        return (
          <IdeaList
            ideas={ideas}
            onSelectIdea={handleSelectIdea}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
            selectedIdea={selectedIdea}
            onContinue={() => goToStep("deep_dive")}
          />
        );

      case "deep_dive":
        if (!selectedIdea) {
          // If no idea selected, go back to ideas
          goToStep("ideas");
          return null;
        }
        return (
          <DeepDiveSection
            idea={selectedIdea}
            profile={profile}
            onBack={() => goToStep("ideas")}
          />
        );

      default:
        return <Welcome onNext={() => goToStep("venture_type")} />;
    }
  };

  // Don't show progress bar on welcome or generating screens
  const showProgressBar = !["welcome", "generating", "ideas", "deep_dive"].includes(
    currentStep
  );

  // Show header on welcome, ideas, and deep_dive screens (not during questionnaire)
  const showHeader = ["welcome", "ideas", "deep_dive"].includes(currentStep);

  return (
    <main className="min-h-screen bg-charcoal-dark">
      {/* Header - shown on welcome, ideas, deep_dive */}
      {showHeader && currentStep !== "deep_dive" && <Header />}

      {/* Progress Bar - shown during questionnaire steps */}
      {showProgressBar && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-charcoal-dark/95 backdrop-blur-sm border-b border-warmwhite/5">
          <div className="max-w-2xl mx-auto px-4 py-3 md:py-4">
            <ProgressBar progress={progress} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`transition-opacity duration-150 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        } ${showProgressBar ? "pt-14 md:pt-16" : ""} ${showHeader && currentStep !== "deep_dive" ? "pt-14 md:pt-16" : ""}`}
      >
        <div className="py-6 md:py-12">{renderStep()}</div>
      </div>
    </main>
  );
}
