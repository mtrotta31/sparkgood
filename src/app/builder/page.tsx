"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProgressBar, Header } from "@/components/ui";
import {
  Welcome,
  BusinessCategory,
  // General business path
  TargetCustomer,
  BusinessModel,
  KeySkills,
  // Social enterprise path
  VentureType,
  CauseSelect,
  // Common steps
  Format,
  Location,
  Experience,
  Budget,
  Commitment,
  Depth,
  HasIdea,
  OwnIdea,
  GeneratingScreen,
} from "@/components/steps";
import { IdeaList } from "@/components/results";
import { DeepDiveSectionV2 } from "@/components/deep-dive";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks";
import { STEP_PROGRESS } from "@/lib/constants";
import { loadPendingSession, clearPendingSession } from "@/lib/sessionState";
import { PURCHASE_CONTEXT_KEY } from "@/components/PurchaseModal";
import type {
  UserProfile,
  UserLocation,
  BusinessCategory as BusinessCategoryType,
  TargetCustomer as TargetCustomerType,
  BusinessModelPreference,
  KeySkill,
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
  // Business category (first choice - determines path)
  businessCategory: null,
  // General business path fields
  targetCustomer: null,
  businessModelPreference: null,
  keySkills: [],
  // Social enterprise path fields
  ventureType: null,
  causes: [],
  // Common fields
  format: null,
  location: null,
  experience: null,
  budget: null,
  commitment: null,
  depth: null,
  hasIdea: null,
  ownIdea: "",
};

// Extended Idea type with additional fields from generation
type ExtendedIdea = Idea & { mechanism?: string; whyNow?: string; firstStep?: string };

// Loading fallback for Suspense
function BuilderLoading() {
  return (
    <main className="min-h-screen bg-charcoal-dark flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-spark border-t-transparent animate-spin" />
    </main>
  );
}

// Wrapper component with Suspense for useSearchParams
export default function BuilderPage() {
  return (
    <Suspense fallback={<BuilderLoading />}>
      <BuilderContent />
    </Suspense>
  );
}

function BuilderContent() {
  const searchParams = useSearchParams();
  const pathParam = searchParams.get("path");
  const isSocialEnterprisePath = pathParam === "social-enterprise";
  const hasInitializedPath = useRef(false);

  const [currentStep, setCurrentStep] = useState<StepName>(
    isSocialEnterprisePath ? "venture_type" : "welcome"
  );
  const [profile, setProfile] = useState<UserProfile>({
    ...initialProfile,
    // Auto-select social_enterprise if coming from /good
    businessCategory: isSocialEnterprisePath ? "social_enterprise" : null,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Ideas state
  const [ideas, setIdeas] = useState<ExtendedIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<ExtendedIdea | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const hasStartedGenerating = useRef(false);

  // Auth state
  const { user } = useAuth();
  const { saveSingleIdea, saveProfile } = useUserData();
  const hasRestoredSession = useRef(false);
  const [profileId, setProfileId] = useState<string | null>(null);

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

    // If user is logged in, save profile first to get profileId
    if (user) {
      console.log("[builder] Saving profile before generating ideas");
      const savedProfileId = await saveProfile(profile);
      if (savedProfileId) {
        console.log("[builder] Profile saved with ID:", savedProfileId);
        setProfileId(savedProfileId);
      }
    }

    try {
      const response = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        console.log("[builder] Generated", result.data.length, "ideas");
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
  }, [profile, user, saveProfile]);

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

  // Handle saving a single idea
  const handleSaveSingleIdea = useCallback(async (idea: ExtendedIdea) => {
    console.log("[builder] Saving single idea:", idea.name);

    // If we don't have a profileId yet and user is logged in, save profile first
    let currentProfileId = profileId;
    if (!currentProfileId && user) {
      console.log("[builder] No profileId, saving profile first");
      currentProfileId = await saveProfile(profile);
      if (currentProfileId) {
        setProfileId(currentProfileId);
      }
    }

    const result = await saveSingleIdea(idea, currentProfileId || undefined);
    console.log("[builder] Save single idea result:", result);
    return result;
  }, [profileId, user, profile, saveProfile, saveSingleIdea]);

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

  // Handle social enterprise path from /good
  useEffect(() => {
    if (isSocialEnterprisePath && !hasInitializedPath.current) {
      hasInitializedPath.current = true;
      // Auto-set social_enterprise and skip to venture_type
      setProfile((prev) => ({
        ...prev,
        businessCategory: "social_enterprise",
      }));
      setCurrentStep("venture_type");
    }
  }, [isSocialEnterprisePath]);

  // Restore session state after Stripe checkout completes
  useEffect(() => {
    // Check for purchase success URL params
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseParam = urlParams.get("purchase");
    const sessionId = urlParams.get("session_id");

    // Handle deep_dive or launch_kit purchases that return to /builder
    if ((purchaseParam === "deep_dive" || purchaseParam === "launch_kit") && sessionId && !hasRestoredSession.current) {
      const pendingSession = loadPendingSession();
      if (pendingSession) {
        // Mark as restored to prevent running again
        hasRestoredSession.current = true;

        // Restore the saved state
        setProfile(pendingSession.profile);
        setIdeas(pendingSession.ideas as ExtendedIdea[]);

        // Find and set the selected idea
        if (pendingSession.selectedIdeaId) {
          const selected = pendingSession.ideas.find(
            (idea) => idea.id === pendingSession.selectedIdeaId
          );
          if (selected) {
            setSelectedIdea(selected as ExtendedIdea);
          }
        }

        // Navigate to deep dive (the DeepDiveSectionV2 will handle the purchase verification)
        // For launch_kit, the URL params will tell DeepDiveSectionV2 to auto-open the Launch Kit modal
        setCurrentStep("deep_dive");

        // Clear the pending session (but keep URL params for DeepDiveSectionV2 to process)
        clearPendingSession();
      }
    }
  }, []); // Run once on mount

  // Restore session state after auth completes
  useEffect(() => {
    // Only run when user becomes authenticated and we haven't already restored
    if (!user || hasRestoredSession.current) return;

    const pendingSession = loadPendingSession();
    if (!pendingSession) return;

    // Mark as restored to prevent running again
    hasRestoredSession.current = true;

    // Restore the saved state
    setProfile(pendingSession.profile);
    setIdeas(pendingSession.ideas as ExtendedIdea[]);

    // Find and set the selected idea
    if (pendingSession.selectedIdeaId) {
      const selected = pendingSession.ideas.find(
        (idea) => idea.id === pendingSession.selectedIdeaId
      );
      if (selected) {
        setSelectedIdea(selected as ExtendedIdea);
      }
    }

    // Navigate to the appropriate step based on pending action
    if (pendingSession.pendingAction === "deep_dive" && pendingSession.selectedIdeaId) {
      // Go directly to deep dive
      setCurrentStep("deep_dive");
    } else {
      // Go to ideas list
      setCurrentStep("ideas");
    }

    // Clear the pending session
    clearPendingSession();
  }, [user]);

  // Restore session state when returning from example page (from purchase modal)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const restorePurchase = urlParams.get("restorePurchase");
    const ideaId = urlParams.get("ideaId");

    if (restorePurchase === "true" && ideaId && !hasRestoredSession.current) {
      // Load purchase context from sessionStorage
      const stored = sessionStorage.getItem(PURCHASE_CONTEXT_KEY);
      if (stored) {
        try {
          const context = JSON.parse(stored);
          if (context.ideas && context.selectedIdeaIndex !== undefined) {
            // Mark as restored to prevent running again
            hasRestoredSession.current = true;

            // Restore the ideas and selected idea
            setIdeas(context.ideas as ExtendedIdea[]);
            const selectedIdea = context.ideas[context.selectedIdeaIndex];
            if (selectedIdea) {
              setSelectedIdea(selectedIdea as ExtendedIdea);
            }

            // Navigate to deep dive (purchase modal will auto-show due to lack of access)
            setCurrentStep("deep_dive");

            // Clear the purchase context from sessionStorage
            sessionStorage.removeItem(PURCHASE_CONTEXT_KEY);

            // Clean up URL params
            window.history.replaceState({}, "", "/builder");
          }
        } catch {
          // Invalid JSON, ignore
          sessionStorage.removeItem(PURCHASE_CONTEXT_KEY);
        }
      }
    }
  }, []); // Run once on mount

  // Step navigation logic - branching based on businessCategory
  const isSocialEnterprise = profile.businessCategory === "social_enterprise";

  const getNextStep = (current: StepName): StepName => {
    // After welcome, always go to business_category
    if (current === "welcome") return "business_category";

    // After business_category, branch based on selection
    if (current === "business_category") {
      return isSocialEnterprise ? "venture_type" : "target_customer";
    }

    // Social Enterprise path
    if (isSocialEnterprise) {
      const socialEnterpriseSteps: StepName[] = [
        "business_category",
        "venture_type",
        "format",
        "location",
        "causes",
        "experience",
        "budget",
        "commitment",
        "depth",
        "has_idea",
      ];
      const currentIndex = socialEnterpriseSteps.indexOf(current);
      if (currentIndex === -1) return "business_category";

      // Special case: after has_idea
      if (current === "has_idea") {
        return profile.hasIdea ? "own_idea" : "generating";
      }
      if (current === "own_idea") return "generating";

      return socialEnterpriseSteps[currentIndex + 1] || "ideas";
    }

    // General Business path
    const businessSteps: StepName[] = [
      "business_category",
      "target_customer",
      "business_model",
      "key_skills",
      "location",
      "experience",
      "budget",
      "commitment",
      "depth",
      "has_idea",
    ];
    const currentIndex = businessSteps.indexOf(current);
    if (currentIndex === -1) return "business_category";

    // Special case: after has_idea
    if (current === "has_idea") {
      return profile.hasIdea ? "own_idea" : "generating";
    }
    if (current === "own_idea") return "generating";

    return businessSteps[currentIndex + 1] || "ideas";
  };

  const getPrevStep = (current: StepName): StepName => {
    // Special case: from own_idea, go back to has_idea
    if (current === "own_idea") return "has_idea";

    // Social Enterprise path
    if (isSocialEnterprise) {
      const socialEnterpriseSteps: StepName[] = [
        "welcome",
        "business_category",
        "venture_type",
        "format",
        "location",
        "causes",
        "experience",
        "budget",
        "commitment",
        "depth",
        "has_idea",
      ];
      const currentIndex = socialEnterpriseSteps.indexOf(current);
      if (currentIndex <= 0) return "welcome";
      return socialEnterpriseSteps[currentIndex - 1];
    }

    // General Business path
    const businessSteps: StepName[] = [
      "welcome",
      "business_category",
      "target_customer",
      "business_model",
      "key_skills",
      "location",
      "experience",
      "budget",
      "commitment",
      "depth",
      "has_idea",
    ];
    const currentIndex = businessSteps.indexOf(current);
    if (currentIndex <= 0) return "welcome";
    return businessSteps[currentIndex - 1];
  };

  // Render current step
  const renderStep = () => {
    const stepProps = {
      onNext: () => goToStep(getNextStep(currentStep)),
      onBack: () => goToStep(getPrevStep(currentStep)),
    };

    switch (currentStep) {
      case "welcome":
        return <Welcome onNext={() => goToStep("business_category")} />;

      case "business_category":
        return (
          <BusinessCategory
            value={profile.businessCategory}
            onChange={(v: BusinessCategoryType) => updateProfile("businessCategory", v)}
            {...stepProps}
          />
        );

      // General business path steps
      case "target_customer":
        return (
          <TargetCustomer
            value={profile.targetCustomer}
            onChange={(v: TargetCustomerType) => updateProfile("targetCustomer", v)}
            {...stepProps}
          />
        );

      case "business_model":
        return (
          <BusinessModel
            value={profile.businessModelPreference}
            onChange={(v: BusinessModelPreference) => updateProfile("businessModelPreference", v)}
            {...stepProps}
          />
        );

      case "key_skills":
        return (
          <KeySkills
            value={profile.keySkills}
            onChange={(v: KeySkill[]) => updateProfile("keySkills", v)}
            {...stepProps}
          />
        );

      // Social enterprise path steps
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

      case "location":
        return (
          <Location
            value={profile.location}
            onChange={(v: UserLocation | null) => updateProfile("location", v)}
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
            profile={profile}
            onSelectIdea={handleSelectIdea}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
            selectedIdea={selectedIdea}
            onContinue={() => goToStep("deep_dive")}
            onSaveSingleIdea={handleSaveSingleIdea}
          />
        );

      case "deep_dive":
        if (!selectedIdea) {
          // If no idea selected, go back to ideas
          goToStep("ideas");
          return null;
        }
        return (
          <DeepDiveSectionV2
            idea={selectedIdea}
            ideas={ideas}
            profile={profile}
            onBack={() => goToStep("ideas")}
            profileId={profileId || undefined}
          />
        );

      default:
        return <Welcome onNext={() => goToStep("business_category")} />;
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
