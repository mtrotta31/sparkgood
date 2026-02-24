"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FadeIn } from "@/components/ui";
import { useUserData, useCredits } from "@/hooks";
import { savePendingSession } from "@/lib/sessionState";
import PurchaseModal from "@/components/PurchaseModal";
import LaunchChecklist from "@/components/results/LaunchChecklist";
import BusinessFoundation from "@/components/results/BusinessFoundation";
import BusinessOverview from "@/components/results/BusinessOverview";
import GrowthPlan from "@/components/results/GrowthPlan";
import FinancialModel from "@/components/results/FinancialModel";
import LocalResources from "@/components/results/LocalResources";
import AIAdvisor from "@/components/results/AIAdvisor";
import ConfirmDialog from "./ConfirmDialog";
import LaunchKitModalV2 from "./LaunchKitModalV2";
import type {
  Idea,
  UserProfile,
  LaunchKit,
  LaunchChecklistData,
  BusinessFoundationData,
  GrowthPlanData,
  FinancialModelData,
  LocalResourcesData,
  ChecklistProgress,
} from "@/types";

type TabId = "foundation" | "checklist" | "growth" | "financial" | "resources" | "advisor";

interface Tab {
  id: TabId;
  label: string;
  emoji: string;
}

const tabs: Tab[] = [
  {
    id: "foundation",
    label: "Business Foundation",
    emoji: "🏗️",
  },
  {
    id: "checklist",
    label: "Launch Checklist",
    emoji: "🚀",
  },
  {
    id: "growth",
    label: "Growth Plan",
    emoji: "📈",
  },
  {
    id: "financial",
    label: "Financial Model",
    emoji: "💰",
  },
  {
    id: "resources",
    label: "Local Resources",
    emoji: "📍",
  },
  {
    id: "advisor",
    label: "AI Advisor",
    emoji: "💬",
  },
];

interface DeepDiveSectionV2Props {
  idea: Idea;
  ideas: Idea[];
  profile: UserProfile;
  onBack: () => void;
  profileId?: string;
  initialSavedIdeaId?: string; // For pre-saved projects, skip the save step
  // Initial content for pre-saved projects (avoids regeneration)
  initialChecklist?: LaunchChecklistData;
  initialFoundation?: BusinessFoundationData;
  initialGrowth?: GrowthPlanData;
  initialFinancial?: FinancialModelData;
  initialLocalResources?: LocalResourcesData;
  initialChecklistProgress?: ChecklistProgress;
  // Header customization for project page
  backText?: string; // Customize "Back to Ideas" text
  onDelete?: () => void; // If provided, show delete button in header
}

export default function DeepDiveSectionV2({
  idea,
  ideas,
  profile,
  onBack,
  profileId,
  initialSavedIdeaId,
  initialChecklist,
  initialFoundation,
  initialGrowth,
  initialFinancial,
  initialLocalResources,
  initialChecklistProgress,
  backText = "Back to Ideas",
  onDelete,
}: DeepDiveSectionV2Props) {
  const [activeTab, setActiveTab] = useState<TabId>("foundation");
  const [loadingTab, setLoadingTab] = useState<TabId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(!!initialSavedIdeaId); // Already saved if we have an ID
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // Credits and access control
  const { hasDeepDiveAccess, hasLaunchKitAccess, refetch: refetchCredits, loading: creditsLoading } = useCredits();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showLaunchKitPurchaseModal, setShowLaunchKitPurchaseModal] = useState(false);
  const [hasUnlockedAccess, setHasUnlockedAccess] = useState(false);

  // Regenerate confirmation dialog state
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [tabToRegenerate, setTabToRegenerate] = useState<TabId | null>(null);

  // Launch Kit modal state
  const [showLaunchKit, setShowLaunchKit] = useState(false);
  const [launchKit, setLaunchKit] = useState<LaunchKit | null>(null);
  // V2 assets from new API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [launchKitV2, setLaunchKitV2] = useState<any | null>(null);
  const [isGeneratingLaunchKit, setIsGeneratingLaunchKit] = useState(false);
  const [launchKitError, setLaunchKitError] = useState<string | null>(null);
  const [launchKitFailedAssets, setLaunchKitFailedAssets] = useState<string[]>([]);

  // Content state for each section (initialized from props if available)
  const [checklist, setChecklist] = useState<LaunchChecklistData | null>(initialChecklist || null);
  const [foundation, setFoundation] = useState<BusinessFoundationData | null>(initialFoundation || null);
  const [growth, setGrowth] = useState<GrowthPlanData | null>(initialGrowth || null);
  const [financial, setFinancial] = useState<FinancialModelData | null>(initialFinancial || null);
  const [localResources, setLocalResources] = useState<LocalResourcesData | null>(initialLocalResources || null);

  // Checklist progress state
  const [checklistProgress, setChecklistProgress] = useState<ChecklistProgress>(initialChecklistProgress || {});

  // The saved idea ID from Supabase (used for deep dive results)
  // Initialize with initialSavedIdeaId if provided (for pre-saved projects)
  const [savedIdeaId, setSavedIdeaId] = useState<string | null>(initialSavedIdeaId || null);

  // Track which tabs have been fetched to prevent duplicate requests
  const fetchedTabs = useRef<Set<TabId>>(new Set());
  // Track current request to ignore stale responses
  const currentRequestId = useRef<number>(0);
  // Track which tabs have been saved
  const savedTabs = useRef<Set<TabId>>(new Set());
  // Track if we've attempted to save the idea (skip if we already have a saved ID)
  const hasAttemptedSaveIdea = useRef(!!initialSavedIdeaId);
  // Track if we've initialized from props
  const hasInitializedFromProps = useRef(false);

  // Initialize refs with content from props (only once on mount)
  useEffect(() => {
    if (hasInitializedFromProps.current) return;
    hasInitializedFromProps.current = true;

    if (initialChecklist) {
      fetchedTabs.current.add("checklist");
      savedTabs.current.add("checklist");
    }
    if (initialFoundation) {
      fetchedTabs.current.add("foundation");
      savedTabs.current.add("foundation");
    }
    if (initialGrowth) {
      fetchedTabs.current.add("growth");
      savedTabs.current.add("growth");
    }
    if (initialFinancial) {
      fetchedTabs.current.add("financial");
      savedTabs.current.add("financial");
    }
    if (initialLocalResources) {
      fetchedTabs.current.add("resources");
      savedTabs.current.add("resources");
    }
  }, [initialChecklist, initialFoundation, initialGrowth, initialFinancial, initialLocalResources]);

  // User data hook for saving results
  const { isAuthenticated } = useUserData();

  // Save the idea to Supabase when entering deep dive (if authenticated)
  useEffect(() => {
    const saveIdeaToProjects = async () => {
      if (!isAuthenticated || hasAttemptedSaveIdea.current) return;
      hasAttemptedSaveIdea.current = true;

      console.log("[DeepDiveSectionV2] Saving idea to projects:", idea.name);

      try {
        const response = await fetch("/api/user/ideas/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea, profileId }),
        });

        const result = await response.json();
        console.log("[DeepDiveSectionV2] Save idea result:", result);

        if (result.success) {
          setSavedIdeaId(result.data.savedId);
          setIsSaved(true);

          // Load existing checklist progress if available
          if (result.data.checklistProgress) {
            setChecklistProgress(result.data.checklistProgress);
          }
        }
      } catch (err) {
        console.error("[DeepDiveSectionV2] Error saving idea:", err);
      }
    };

    saveIdeaToProjects();
  }, [isAuthenticated, idea, profileId]);

  // Track if we're returning from a successful Stripe purchase
  const [isReturningFromPurchase, setIsReturningFromPurchase] = useState(false);
  const [isReturningFromLaunchKitPurchase, setIsReturningFromLaunchKitPurchase] = useState(false);

  // Check for successful purchase return IMMEDIATELY on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseParam = urlParams.get("purchase");
    const sessionId = urlParams.get("session_id");

    if (purchaseParam === "deep_dive" && sessionId) {
      setIsReturningFromPurchase(true);
      setHasUnlockedAccess(true);
      window.history.replaceState({}, "", window.location.pathname);
      refetchCredits();
    } else if (purchaseParam === "launch_kit" && sessionId) {
      setIsReturningFromPurchase(true);
      setIsReturningFromLaunchKitPurchase(true);
      setHasUnlockedAccess(true);
      window.history.replaceState({}, "", window.location.pathname);
      refetchCredits();
    }
  }, [refetchCredits]);

  // Check credits-based access
  useEffect(() => {
    if (isReturningFromPurchase) return;
    if (creditsLoading) return;

    const hasAccess = hasDeepDiveAccess(idea.id);

    if (hasAccess) {
      setHasUnlockedAccess(true);
    } else {
      setShowPurchaseModal(true);
    }
  }, [creditsLoading, hasDeepDiveAccess, idea.id, isReturningFromPurchase]);

  // Consume credit when accessing
  useEffect(() => {
    if (!hasUnlockedAccess) return;

    const consumeCredit = async () => {
      try {
        await fetch("/api/user/credits/consume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "deep_dive", ideaId: idea.id }),
        });
      } catch (err) {
        console.error("Error consuming credit:", err);
      }
    };

    consumeCredit();
  }, [hasUnlockedAccess, idea.id]);

  // Check if content exists for a tab
  const hasContent = useCallback((tabId: TabId): boolean => {
    switch (tabId) {
      case "checklist": return checklist !== null;
      case "foundation": return foundation !== null;
      case "growth": return growth !== null;
      case "financial": return financial !== null;
      case "resources": return localResources !== null;
      case "advisor": return true; // Placeholder always available
    }
  }, [checklist, foundation, growth, financial, localResources]);

  // Count how many of the 5 content tabs are complete (excluding advisor)
  const contentTabsComplete = [foundation, checklist, growth, financial, localResources].filter(Boolean).length;
  const allContentTabsComplete = contentTabsComplete === 5;
  const isLaunchKitReady = allContentTabsComplete;

  // Fetch content for a specific tab
  const fetchContent = useCallback(async (tabId: TabId) => {
    // Skip advisor - it's a placeholder
    if (tabId === "advisor") return;

    if (fetchedTabs.current.has(tabId)) {
      return;
    }

    fetchedTabs.current.add(tabId);
    const requestId = ++currentRequestId.current;

    setLoadingTab(tabId);
    setError(null);

    try {
      // Resources tab uses a different API endpoint
      const endpoint = tabId === "resources" ? "/api/deep-dive/resources" : "/api/deep-dive";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          profile,
          section: tabId,
        }),
      });

      const result = await response.json();

      if (requestId !== currentRequestId.current) {
        console.log("Ignoring stale response for", tabId);
        return;
      }

      if (result.success && result.data) {
        switch (tabId) {
          case "checklist":
            setChecklist(result.data as LaunchChecklistData);
            break;
          case "foundation":
            setFoundation(result.data as BusinessFoundationData);
            break;
          case "growth":
            setGrowth(result.data as GrowthPlanData);
            break;
          case "financial":
            setFinancial(result.data as FinancialModelData);
            break;
          case "resources":
            setLocalResources(result.data as LocalResourcesData);
            break;
        }
      } else {
        setError(result.error || "Failed to load content");
        fetchedTabs.current.delete(tabId);
      }
    } catch (err) {
      console.error("Error fetching deep dive content:", err);
      setError("Something went wrong. Please try again.");
      fetchedTabs.current.delete(tabId);
    } finally {
      if (requestId === currentRequestId.current) {
        setLoadingTab(null);
      }
    }
  }, [idea, profile]);

  // Fetch content when tab changes
  useEffect(() => {
    if (!hasUnlockedAccess) return;
    if (!hasContent(activeTab) && activeTab !== "advisor") {
      fetchContent(activeTab);
    }
  }, [activeTab, fetchContent, hasContent, hasUnlockedAccess]);

  // Handle regenerate request
  const handleRegenerateRequest = useCallback((tabId: TabId) => {
    if (tabId === "advisor") return;
    setTabToRegenerate(tabId);
    setShowRegenerateConfirm(true);
  }, []);

  // Confirm regeneration
  const handleRegenerateConfirm = useCallback(async () => {
    if (!tabToRegenerate) return;

    setShowRegenerateConfirm(false);

    switch (tabToRegenerate) {
      case "checklist":
        setChecklist(null);
        break;
      case "foundation":
        setFoundation(null);
        break;
      case "growth":
        setGrowth(null);
        break;
      case "financial":
        setFinancial(null);
        break;
      case "resources":
        setLocalResources(null);
        break;
    }

    fetchedTabs.current.delete(tabToRegenerate);
    savedTabs.current.delete(tabToRegenerate);

    await fetchContent(tabToRegenerate);

    setTabToRegenerate(null);
  }, [tabToRegenerate, fetchContent]);

  const handleRegenerateCancel = useCallback(() => {
    setShowRegenerateConfirm(false);
    setTabToRegenerate(null);
  }, []);

  const getTabLabel = (tabId: TabId): string => {
    switch (tabId) {
      case "checklist": return "launch checklist";
      case "foundation": return "business foundation";
      case "growth": return "growth plan";
      case "financial": return "financial model";
      case "resources": return "local resources";
      case "advisor": return "AI advisor";
    }
  };

  // Handle checklist progress change
  const handleChecklistProgressChange = useCallback(async (itemId: string, checked: boolean) => {
    const newProgress = { ...checklistProgress, [itemId]: checked };
    setChecklistProgress(newProgress);

    // Save to Supabase if logged in
    if (savedIdeaId && isAuthenticated) {
      try {
        await fetch("/api/user/deep-dive/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ideaId: savedIdeaId,
            checklistProgress: newProgress,
          }),
        });
      } catch (err) {
        console.error("Error saving checklist progress:", err);
      }
    }
  }, [checklistProgress, savedIdeaId, isAuthenticated]);

  // Helper function to transform API response to modal format
  const transformLaunchKitResponse = useCallback((result: { assets: Record<string, unknown>; textContent?: Record<string, unknown>; failedAssets?: string[] }) => {
    const { textContent, assets, failedAssets } = result;

    // Track failed assets
    setLaunchKitFailedAssets(failedAssets || []);

    // Convert socialGraphics from object to array format
    type GraphicValue = { url?: string; storagePath: string };
    const socialGraphicsArray = assets?.socialGraphics ? Object.entries(assets.socialGraphics as Record<string, GraphicValue>).map(([key, value]) => {
      const platformMap: Record<string, { name: string; width: number; height: number }> = {
        instagramPost: { name: "instagram-post", width: 1080, height: 1080 },
        instagramStory: { name: "instagram-story", width: 1080, height: 1920 },
        linkedinPost: { name: "linkedin-post", width: 1200, height: 627 },
        facebookCover: { name: "facebook-cover", width: 820, height: 312 },
      };
      const platformInfo = platformMap[key] || { name: key, width: 1080, height: 1080 };
      return {
        platform: platformInfo.name,
        url: value.url || "",
        storagePath: value.storagePath,
        dimensions: { width: platformInfo.width, height: platformInfo.height },
      };
    }) : [];

    // Build the transformed V2 assets object
    const transformedAssets = {
      textContent,
      landingPage: assets?.landingPage,
      pitchDeck: assets?.pitchDeck,
      socialGraphics: socialGraphicsArray,
      onePager: assets?.onePager,
    };

    setLaunchKitV2(transformedAssets);

    // Also set V1 launchKit for backwards compatibility if textContent exists
    if (textContent) {
      setLaunchKit({
        elevatorPitch: textContent.elevatorPitch as string,
        socialPosts: textContent.socialPosts as LaunchKit["socialPosts"],
        emailSequence: textContent.emailSequence as LaunchKit["emailSequence"],
        landingPage: textContent.landingPageCopy ? {
          headline: (textContent.landingPageCopy as { headline: string }).headline,
          subheadline: (textContent.landingPageCopy as { subheadline: string }).subheadline,
          html: "",
        } : { headline: "", subheadline: "", html: "" },
      });
    }
  }, []);

  // Auto-trigger Launch Kit generation when returning from purchase
  useEffect(() => {
    if (isReturningFromLaunchKitPurchase && hasUnlockedAccess) {
      const timer = setTimeout(() => {
        setShowLaunchKit(true);
        setIsGeneratingLaunchKit(true);
        setLaunchKitError(null);
        setLaunchKitFailedAssets([]);

        fetch("/api/launch-kit/v2", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idea,
            profile,
            savedIdeaId,
            foundation,
            growth,
            financial,
            checklist,
            matchedResources: localResources,
          }),
        })
          .then((response) => response.json())
          .then((result) => {
            if (result.success && result.data) {
              // Use the transform helper to handle response and failed assets
              transformLaunchKitResponse(result.data);
            } else {
              setLaunchKitError(result.error || "Failed to generate launch kit");
            }
          })
          .catch((err) => {
            console.error("Error generating launch kit:", err);
            setLaunchKitError("Something went wrong. Please try again.");
          })
          .finally(() => {
            setIsGeneratingLaunchKit(false);
            setIsReturningFromLaunchKitPurchase(false);
          });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isReturningFromLaunchKitPurchase, hasUnlockedAccess, idea, profile, savedIdeaId, foundation, growth, financial, checklist, localResources, transformLaunchKitResponse]);

  // Generate Launch Kit (or load saved assets)
  const handleGenerateLaunchKit = useCallback(async () => {
    setShowLaunchKit(true);
    setLaunchKitError(null);
    setLaunchKitFailedAssets([]);

    // Skip if we already have V2 assets loaded in memory
    if (launchKitV2) {
      return;
    }

    // FIRST: Check if we have saved assets in the database
    if (savedIdeaId) {
      console.log("[LaunchKit] Checking for saved assets...");
      try {
        const checkResponse = await fetch(`/api/launch-kit/v2?savedIdeaId=${savedIdeaId}`);
        const checkResult = await checkResponse.json();

        if (checkResult.success && checkResult.data?.assets) {
          console.log("[LaunchKit] Found saved assets, loading...");
          transformLaunchKitResponse(checkResult.data);
          return; // Don't generate, we loaded saved assets
        }
        console.log("[LaunchKit] No saved assets found, will generate...");
      } catch (err) {
        console.log("[LaunchKit] Error checking saved assets, will generate:", err);
      }
    }

    // No saved assets, generate new ones
    setIsGeneratingLaunchKit(true);

    try {
      const response = await fetch("/api/launch-kit/v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          profile,
          savedIdeaId,
          foundation,
          growth,
          financial,
          checklist,
          matchedResources: localResources,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        transformLaunchKitResponse(result.data);
      } else {
        setLaunchKitError(result.error || "Failed to generate launch kit");
      }
    } catch (err) {
      console.error("Error generating launch kit:", err);
      setLaunchKitError("Something went wrong. Please try again.");
    } finally {
      setIsGeneratingLaunchKit(false);
    }
  }, [idea, profile, savedIdeaId, foundation, growth, financial, checklist, localResources, launchKitV2, transformLaunchKitResponse]);

  // Handle Launch Kit button click
  const handleLaunchKitClick = useCallback(() => {
    const canAccess = hasLaunchKitAccess(idea.id);

    if (canAccess) {
      handleGenerateLaunchKit();
    } else {
      setShowLaunchKitPurchaseModal(true);
    }
  }, [idea.id, hasLaunchKitAccess, handleGenerateLaunchKit]);

  // Handle regenerating failed Launch Kit assets
  const handleRegenerateLaunchKit = useCallback(async () => {
    // Clear existing launch kit data to force regeneration
    setLaunchKitV2(null);
    setLaunchKit(null);
    setLaunchKitFailedAssets([]);
    setLaunchKitError(null);
    setIsGeneratingLaunchKit(true);

    try {
      const response = await fetch("/api/launch-kit/v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          profile,
          savedIdeaId,
          foundation,
          growth,
          financial,
          checklist,
          matchedResources: localResources,
          forceRegenerate: true, // Signal to API to regenerate even if assets exist
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        transformLaunchKitResponse(result.data);
      } else {
        setLaunchKitError(result.error || "Failed to regenerate launch kit");
      }
    } catch (err) {
      console.error("Error regenerating launch kit:", err);
      setLaunchKitError("Something went wrong. Please try again.");
    } finally {
      setIsGeneratingLaunchKit(false);
    }
  }, [idea, profile, savedIdeaId, foundation, growth, financial, checklist, localResources, transformLaunchKitResponse]);

  // Auto-save results when logged in
  useEffect(() => {
    const saveResults = async () => {
      if (!isAuthenticated || !savedIdeaId) {
        return;
      }

      // Build update payload with only changed tabs
      const updatePayload: Record<string, unknown> = { ideaId: savedIdeaId };
      let hasChanges = false;

      if (checklist && !savedTabs.current.has("checklist")) {
        updatePayload.checklist = checklist;
        hasChanges = true;
      }
      if (foundation && !savedTabs.current.has("foundation")) {
        updatePayload.foundation = foundation;
        hasChanges = true;
      }
      if (growth && !savedTabs.current.has("growth")) {
        updatePayload.growth = growth;
        hasChanges = true;
      }
      if (financial && !savedTabs.current.has("financial")) {
        updatePayload.financial = financial;
        hasChanges = true;
      }
      if (localResources && !savedTabs.current.has("resources")) {
        updatePayload.matchedResources = localResources;
        hasChanges = true;
      }

      if (!hasChanges) return;

      try {
        const response = await fetch("/api/user/deep-dive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });

        if (response.ok) {
          // Mark tabs as saved
          if (checklist) savedTabs.current.add("checklist");
          if (foundation) savedTabs.current.add("foundation");
          if (growth) savedTabs.current.add("growth");
          if (financial) savedTabs.current.add("financial");
          if (localResources) savedTabs.current.add("resources");
          setIsSaved(true);
        } else {
          console.error("[DeepDiveV2] Failed to auto-save:", await response.text());
        }
      } catch (error) {
        console.error("[DeepDiveV2] Auto-save error:", error);
      }
    };

    saveResults();
  }, [isAuthenticated, savedIdeaId, checklist, foundation, growth, financial, localResources]);

  // Get content for current tab
  const getCurrentContent = () => {
    switch (activeTab) {
      case "checklist": return checklist;
      case "foundation": return foundation;
      case "growth": return growth;
      case "financial": return financial;
      case "resources": return localResources;
      case "advisor": return true; // Placeholder
    }
  };

  const isLoading = loadingTab === activeTab;
  const content = getCurrentContent();

  const hasAnyContent = checklist || foundation || growth || financial;

  // Download PDF handler
  const downloadPDF = async () => {
    if (!hasAnyContent) return;

    setIsDownloadingPDF(true);
    try {
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          profile,
          checklist,
          foundation,
          growth,
          financial,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      link.download = filenameMatch?.[1] || `sparklocal-${idea.name.toLowerCase().replace(/\s+/g, "-")}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      setError(err instanceof Error ? err.message : "Failed to download PDF");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

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
                  SparkLocal
                </span>
              </a>

              <div className="w-px h-5 bg-warmwhite/20 hidden sm:block" />

              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-warmwhite-muted hover:text-warmwhite transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">{backText}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {isSaved && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Saved
                </span>
              )}
              <div className="relative group">
                <button
                  onClick={handleLaunchKitClick}
                  disabled={!isLaunchKitReady}
                  className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                    ${isLaunchKitReady
                      ? "bg-gradient-to-r from-spark to-accent text-charcoal-dark hover:opacity-90 hover:scale-105"
                      : "bg-warmwhite/10 text-warmwhite-muted cursor-not-allowed"
                    }`}
                  title={isLaunchKitReady ? "Generate complete marketing package" : `Generate all deep dive tabs to unlock (${contentTabsComplete}/5 complete)`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="hidden sm:inline">Launch Kit</span>
                  {!isLaunchKitReady && (
                    <span className="hidden sm:inline text-warmwhite-dim">({contentTabsComplete}/5)</span>
                  )}
                </button>
                {/* Tooltip for disabled state */}
                {!isLaunchKitReady && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-charcoal-light border border-warmwhite/10 rounded-lg text-xs text-warmwhite-muted whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    Generate all deep dive tabs to unlock
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-charcoal-light border-l border-t border-warmwhite/10 rotate-45" />
                  </div>
                )}
              </div>
              <button
                onClick={downloadPDF}
                disabled={!hasAnyContent || isDownloadingPDF}
                className={`
                  flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-xs font-medium
                  transition-all duration-200
                  ${hasAnyContent && !isDownloadingPDF
                    ? "bg-spark/10 text-spark hover:bg-spark/20 hover:scale-105"
                    : "bg-warmwhite/5 text-warmwhite-muted cursor-not-allowed"
                  }
                `}
                title={hasAnyContent ? "Download your plan as PDF" : "Generate content first to download"}
              >
                {isDownloadingPDF ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="hidden sm:inline">Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden sm:inline">Download PDF</span>
                  </>
                )}
              </button>
              <span className="text-xs font-medium text-spark bg-spark/10 px-2 md:px-3 py-1 rounded-full">
                Premium
              </span>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}
            </div>
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

          {/* Tabs */}
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
                <span className="text-base">{tab.emoji}</span>
                <span className="hidden sm:inline">{tab.label}</span>
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
        {/* Loading credits state */}
        {creditsLoading && (
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
              <p className="text-warmwhite font-medium">Checking access...</p>
            </div>
          </FadeIn>
        )}

        {/* Locked state */}
        {!creditsLoading && !hasUnlockedAccess && (
          <FadeIn duration={300}>
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-spark/10 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-2">
                Unlock Deep Dive Analysis
              </h2>
              <p className="text-warmwhite-muted max-w-md mb-6">
                Get comprehensive market research, business planning, and action roadmap for this idea.
              </p>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="px-6 py-3 font-medium rounded-xl bg-spark text-charcoal hover:bg-spark-light transition-colors"
              >
                Unlock for $4.99
              </button>
            </div>
          </FadeIn>
        )}

        {error && hasUnlockedAccess && (
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

        {hasUnlockedAccess && isLoading && !content && (
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
                    stroke="url(#spinGradient2)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="60 200"
                  />
                  <defs>
                    <linearGradient id="spinGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
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
                We&apos;re searching real market data and analyzing competitors. This takes 1-2 minutes because we&apos;re pulling live information and building detailed analysis.
              </p>
            </div>
          </FadeIn>
        )}

        {hasUnlockedAccess && content && !isLoading && (
          <FadeIn duration={400}>
            {/* Regenerate Button (not for advisor) */}
            {activeTab !== "advisor" && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => handleRegenerateRequest(activeTab)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-warmwhite-muted hover:text-warmwhite
                    bg-charcoal-light hover:bg-charcoal-light/80 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Regenerate
                </button>
              </div>
            )}

            {activeTab === "checklist" && checklist && (
              <LaunchChecklist
                data={checklist}
                progress={checklistProgress}
                onProgressChange={handleChecklistProgressChange}
              />
            )}
            {activeTab === "foundation" && (
              <>
                <BusinessOverview idea={idea} />
                {foundation && <BusinessFoundation data={foundation} />}
              </>
            )}
            {activeTab === "growth" && growth && (
              <GrowthPlan data={growth} />
            )}
            {activeTab === "financial" && financial && (
              <FinancialModel data={financial} />
            )}
            {activeTab === "resources" && localResources && (
              <LocalResources data={localResources} />
            )}
            {activeTab === "advisor" && savedIdeaId && (
              <AIAdvisor projectId={savedIdeaId} ideaName={idea.name} />
            )}
            {activeTab === "advisor" && !savedIdeaId && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-spark/10 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold text-warmwhite mb-2">Sign in to access AI Advisor</h3>
                <p className="text-warmwhite-muted text-sm max-w-md">
                  Create an account or sign in to chat with your personalized AI business advisor.
                </p>
              </div>
            )}
          </FadeIn>
        )}
      </div>

      {/* Regenerate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showRegenerateConfirm}
        title="Regenerate content?"
        message={`This will replace your current ${tabToRegenerate ? getTabLabel(tabToRegenerate) : "content"} with fresh AI-generated content. This cannot be undone.`}
        confirmText="Regenerate"
        cancelText="Keep Current"
        onConfirm={handleRegenerateConfirm}
        onCancel={handleRegenerateCancel}
      />

      {/* Launch Kit Modal */}
      <LaunchKitModalV2
        isOpen={showLaunchKit}
        onClose={() => setShowLaunchKit(false)}
        launchKit={launchKit}
        launchKitV2={launchKitV2}
        isLoading={isGeneratingLaunchKit}
        error={launchKitError}
        ideaName={idea.name}
        failedAssets={launchKitFailedAssets}
        onRegenerate={handleRegenerateLaunchKit}
      />

      {/* Purchase Modal for deep dive access */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => {
          setShowPurchaseModal(false);
          if (!hasUnlockedAccess) {
            onBack();
          }
        }}
        ideaId={idea.id}
        ideaName={idea.name}
        purchaseType="deep_dive"
        ideas={ideas}
        selectedIdeaIndex={ideas.findIndex((i) => i.id === idea.id)}
        onBeforeRedirect={() => {
          savePendingSession({
            profile,
            ideas,
            selectedIdeaId: idea.id,
            pendingAction: "deep_dive",
          });
        }}
      />

      {/* Purchase Modal for Launch Kit */}
      <PurchaseModal
        isOpen={showLaunchKitPurchaseModal}
        onClose={() => setShowLaunchKitPurchaseModal(false)}
        ideaId={idea.id}
        ideaName={idea.name}
        purchaseType="launch_kit"
        hasDeepDive={hasUnlockedAccess}
        ideas={ideas}
        selectedIdeaIndex={ideas.findIndex((i) => i.id === idea.id)}
        onBeforeRedirect={() => {
          savePendingSession({
            profile,
            ideas,
            selectedIdeaId: idea.id,
            pendingAction: "launch_kit",
          });
        }}
      />
    </div>
  );
}
