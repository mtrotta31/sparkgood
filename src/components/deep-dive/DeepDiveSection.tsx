"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FadeIn } from "@/components/ui";
import { useUserData, useCredits } from "@/hooks";
import { savePendingSession } from "@/lib/sessionState";
import PurchaseModal from "@/components/PurchaseModal";
import ViabilityReport from "./ViabilityReport";
import BusinessPlanView from "./BusinessPlanView";
import MarketingAssetsView from "./MarketingAssetsView";
import ActionRoadmapView from "./ActionRoadmapView";
import ConfirmDialog from "./ConfirmDialog";
import LaunchKitModalV2 from "./LaunchKitModalV2";
import type {
  Idea,
  UserProfile,
  ViabilityReport as ViabilityReportType,
  BusinessPlan,
  MarketingAssets,
  ActionRoadmap,
  LaunchKit,
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
  ideas: Idea[]; // Full list of ideas for session state preservation
  profile: UserProfile;
  onBack: () => void;
  profileId?: string;
}

export default function DeepDiveSection({ idea, ideas, profile, onBack, profileId }: DeepDiveSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>("viability");
  const [loadingTab, setLoadingTab] = useState<TabId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
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

  // Content state for each section
  const [viability, setViability] = useState<ViabilityReportType | null>(null);
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [marketing, setMarketing] = useState<MarketingAssets | null>(null);
  const [roadmap, setRoadmap] = useState<ActionRoadmap | null>(null);

  // The saved idea ID from Supabase (used for deep dive results)
  const [savedIdeaId, setSavedIdeaId] = useState<string | null>(null);

  // Track which tabs have been fetched to prevent duplicate requests
  const fetchedTabs = useRef<Set<TabId>>(new Set());
  // Track current request to ignore stale responses
  const currentRequestId = useRef<number>(0);
  // Track which tabs have been saved
  const savedTabs = useRef<Set<TabId>>(new Set());
  // Track if we've attempted to save the idea
  const hasAttemptedSaveIdea = useRef(false);

  // User data hook for saving results
  const { isAuthenticated, saveDeepDiveResult } = useUserData();

  // Save the idea to Supabase when entering deep dive (if authenticated)
  useEffect(() => {
    const saveIdeaToProjects = async () => {
      if (!isAuthenticated || hasAttemptedSaveIdea.current) return;
      hasAttemptedSaveIdea.current = true;

      console.log("[DeepDiveSection] Saving idea to projects:", idea.name);

      try {
        const response = await fetch("/api/user/ideas/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea, profileId }),
        });

        const result = await response.json();
        console.log("[DeepDiveSection] Save idea result:", result);

        if (result.success) {
          setSavedIdeaId(result.data.savedId);
          setIsSaved(true);
        }
      } catch (err) {
        console.error("[DeepDiveSection] Error saving idea:", err);
      }
    };

    saveIdeaToProjects();
  }, [isAuthenticated, idea, profileId]);

  // Track if we're returning from a successful Stripe purchase
  const [isReturningFromPurchase, setIsReturningFromPurchase] = useState(false);
  const [isReturningFromLaunchKitPurchase, setIsReturningFromLaunchKitPurchase] = useState(false);

  // Check for successful purchase return IMMEDIATELY on mount (before credits load)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseParam = urlParams.get("purchase");
    const sessionId = urlParams.get("session_id");

    if (purchaseParam === "deep_dive" && sessionId) {
      // Mark as returning from purchase to prevent modal flash
      setIsReturningFromPurchase(true);
      // Grant access immediately
      setHasUnlockedAccess(true);
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
      // Refetch credits in background to sync state
      refetchCredits();
    } else if (purchaseParam === "launch_kit" && sessionId) {
      // Mark as returning from launch kit purchase
      setIsReturningFromPurchase(true);
      setIsReturningFromLaunchKitPurchase(true);
      // Grant deep dive access (they already have it if buying launch kit add-on)
      setHasUnlockedAccess(true);
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
      // Refetch credits in background to sync state
      refetchCredits();
    }
  }, []); // Run once on mount

  // Check credits-based access (only if not returning from purchase)
  useEffect(() => {
    // Skip if returning from Stripe purchase (already granted access above)
    if (isReturningFromPurchase) return;

    // Skip if still loading credits
    if (creditsLoading) return;

    // Check if user has access to this idea's deep dive
    const hasAccess = hasDeepDiveAccess(idea.id);

    if (hasAccess) {
      setHasUnlockedAccess(true);
    } else {
      // Show purchase modal if no access
      setShowPurchaseModal(true);
    }
  }, [creditsLoading, hasDeepDiveAccess, idea.id, isReturningFromPurchase]);

  // Auto-trigger Launch Kit generation when returning from launch_kit purchase
  useEffect(() => {
    if (isReturningFromLaunchKitPurchase && hasUnlockedAccess) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        setShowLaunchKit(true);
        setIsGeneratingLaunchKit(true);
        setLaunchKitError(null);

        // Generate the launch kit using V2 API
        fetch("/api/launch-kit/v2", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea, profile, savedIdeaId }),
        })
          .then((response) => response.json())
          .then((result) => {
            if (result.success && result.data) {
              setLaunchKitV2(result.data);
              // Also set V1 launchKit for backwards compatibility
              if (result.data.textContent) {
                setLaunchKit({
                  elevatorPitch: result.data.textContent.elevatorPitch,
                  socialPosts: result.data.textContent.socialPosts,
                  emailSequence: result.data.textContent.emailSequence,
                  landingPage: result.data.textContent.landingPageCopy ? {
                    headline: result.data.textContent.landingPageCopy.headline,
                    subheadline: result.data.textContent.landingPageCopy.subheadline,
                    html: "",
                  } : { headline: "", subheadline: "", html: "" },
                });
              }
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
  }, [isReturningFromLaunchKitPurchase, hasUnlockedAccess, idea, profile]);

  // Consume credit when accessing (for subscription users)
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
      case "viability": return viability !== null;
      case "plan": return plan !== null;
      case "marketing": return marketing !== null;
      case "roadmap": return roadmap !== null;
    }
  }, [viability, plan, marketing, roadmap]);

  // Fetch content for a specific tab - stable reference, doesn't depend on content state
  const fetchContent = useCallback(async (tabId: TabId) => {
    // Skip if already fetched or currently fetching
    if (fetchedTabs.current.has(tabId)) {
      return;
    }

    // Mark as fetching to prevent duplicate requests
    fetchedTabs.current.add(tabId);

    // Generate request ID to track this specific request
    const requestId = ++currentRequestId.current;

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

      // Ignore stale responses (from cancelled/old requests)
      if (requestId !== currentRequestId.current) {
        console.log("Ignoring stale response for", tabId);
        return;
      }

      if (result.success && result.data) {
        // Set content ONCE - this is the only version the user will see
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
        // Remove from fetched set so user can retry
        fetchedTabs.current.delete(tabId);
      }
    } catch (err) {
      console.error("Error fetching deep dive content:", err);
      setError("Something went wrong. Please try again.");
      // Remove from fetched set so user can retry
      fetchedTabs.current.delete(tabId);
    } finally {
      // Only clear loading if this is still the current request
      if (requestId === currentRequestId.current) {
        setLoadingTab(null);
      }
    }
  }, [idea, profile]); // Note: NO content state dependencies - prevents re-fetch loops

  // Fetch content when tab changes (only if user has access)
  useEffect(() => {
    if (!hasUnlockedAccess) return;
    if (!hasContent(activeTab)) {
      fetchContent(activeTab);
    }
  }, [activeTab, fetchContent, hasContent, hasUnlockedAccess]);

  // Handle regenerate request - shows confirmation dialog
  const handleRegenerateRequest = useCallback((tabId: TabId) => {
    setTabToRegenerate(tabId);
    setShowRegenerateConfirm(true);
  }, []);

  // Confirm regeneration - clears content and refetches
  const handleRegenerateConfirm = useCallback(async () => {
    if (!tabToRegenerate) return;

    // Close dialog
    setShowRegenerateConfirm(false);

    // Clear the content for this tab
    switch (tabToRegenerate) {
      case "viability":
        setViability(null);
        break;
      case "plan":
        setPlan(null);
        break;
      case "marketing":
        setMarketing(null);
        break;
      case "roadmap":
        setRoadmap(null);
        break;
    }

    // Remove from fetched and saved tracking so it will re-fetch
    fetchedTabs.current.delete(tabToRegenerate);
    savedTabs.current.delete(tabToRegenerate);

    // Fetch new content
    await fetchContent(tabToRegenerate);

    setTabToRegenerate(null);
  }, [tabToRegenerate, fetchContent]);

  // Cancel regeneration
  const handleRegenerateCancel = useCallback(() => {
    setShowRegenerateConfirm(false);
    setTabToRegenerate(null);
  }, []);

  // Get tab label for dialog
  const getTabLabel = (tabId: TabId): string => {
    switch (tabId) {
      case "viability":
        return "viability analysis";
      case "plan":
        return "business plan";
      case "marketing":
        return "marketing assets";
      case "roadmap":
        return "action roadmap";
    }
  };

  // Generate Launch Kit (called after access is verified)
  const handleGenerateLaunchKit = useCallback(async () => {
    setShowLaunchKit(true);
    setLaunchKitError(null);

    // If we already have V2 assets, just show them
    if (launchKitV2) {
      return;
    }

    setIsGeneratingLaunchKit(true);

    try {
      const response = await fetch("/api/launch-kit/v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, profile, savedIdeaId }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Transform API response to modal-expected format
        const { textContent, assets } = result.data;

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

        // Also set V1 launchKit for backwards compatibility
        if (textContent) {
          setLaunchKit({
            elevatorPitch: textContent.elevatorPitch,
            socialPosts: textContent.socialPosts,
            emailSequence: textContent.emailSequence,
            landingPage: textContent.landingPageCopy ? {
              headline: textContent.landingPageCopy.headline,
              subheadline: textContent.landingPageCopy.subheadline,
              html: "",
            } : { headline: "", subheadline: "", html: "" },
          });
        }
      } else {
        setLaunchKitError(result.error || "Failed to generate launch kit");
      }
    } catch (err) {
      console.error("Error generating launch kit:", err);
      setLaunchKitError("Something went wrong. Please try again.");
    } finally {
      setIsGeneratingLaunchKit(false);
    }
  }, [idea, profile, savedIdeaId, launchKitV2]);

  // Handle Launch Kit button click - checks payment first
  const handleLaunchKitClick = useCallback(() => {
    // Check if user has access to launch kit for this idea
    const canAccess = hasLaunchKitAccess(idea.id);

    if (canAccess) {
      // User has access - generate or show launch kit
      handleGenerateLaunchKit();
    } else {
      // User needs to purchase - show purchase modal
      setShowLaunchKitPurchaseModal(true);
    }
  }, [idea.id, hasLaunchKitAccess, handleGenerateLaunchKit]);

  // Auto-save results when logged in and content is loaded
  useEffect(() => {
    const saveResults = async () => {
      // Need savedIdeaId (from Supabase saved_ideas table) to save deep dive results
      if (!isAuthenticated || !savedIdeaId) {
        console.log("[DeepDiveSection] Skipping auto-save:", { isAuthenticated, savedIdeaId });
        return;
      }

      console.log("[DeepDiveSection] Auto-saving deep dive results for:", savedIdeaId);

      // Save each section as it loads, but only once
      if (viability && !savedTabs.current.has("viability")) {
        savedTabs.current.add("viability");
        console.log("[DeepDiveSection] Saving viability for:", savedIdeaId);
        const success = await saveDeepDiveResult(savedIdeaId, { viability });
        console.log("[DeepDiveSection] Viability save result:", success);
        if (success) setIsSaved(true);
      }
      if (plan && !savedTabs.current.has("plan")) {
        savedTabs.current.add("plan");
        console.log("[DeepDiveSection] Saving business plan for:", savedIdeaId);
        await saveDeepDiveResult(savedIdeaId, { businessPlan: plan });
      }
      if (marketing && !savedTabs.current.has("marketing")) {
        savedTabs.current.add("marketing");
        console.log("[DeepDiveSection] Saving marketing for:", savedIdeaId);
        await saveDeepDiveResult(savedIdeaId, { marketing });
      }
      if (roadmap && !savedTabs.current.has("roadmap")) {
        savedTabs.current.add("roadmap");
        console.log("[DeepDiveSection] Saving roadmap for:", savedIdeaId);
        await saveDeepDiveResult(savedIdeaId, { roadmap });
      }
    };

    saveResults();
  }, [isAuthenticated, savedIdeaId, viability, plan, marketing, roadmap, saveDeepDiveResult]);

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

  // Check if we have any content to export
  const hasAnyContent = viability || plan || marketing || roadmap;

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
          viability,
          plan,
          marketing,
          roadmap,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      // Get the PDF blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from Content-Disposition header or use default
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

            <div className="flex items-center gap-2">
              {isSaved && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Saved
                </span>
              )}
              {/* Generate Launch Kit Button */}
              <button
                onClick={handleLaunchKitClick}
                className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-xs font-medium
                  bg-gradient-to-r from-spark to-accent text-charcoal-dark hover:opacity-90 transition-all duration-200 hover:scale-105"
                title="Generate complete marketing package"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="hidden sm:inline">Launch Kit</span>
              </button>
              {/* Download PDF Button */}
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

        {/* Locked state - shown when purchase modal is open */}
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
            {/* Regenerate Button */}
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
              <ActionRoadmapView roadmap={roadmap} idea={idea} profile={profile} />
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
      />

      {/* Purchase Modal for deep dive access */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => {
          setShowPurchaseModal(false);
          // If user closes without purchasing, go back to ideas
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
          // Save session state before redirecting to Stripe
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
          // Save session state before redirecting to Stripe
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
