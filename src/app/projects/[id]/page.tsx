"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { FadeIn } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks";
import PurchaseModal from "@/components/PurchaseModal";
import LaunchKitModal from "@/components/deep-dive/LaunchKitModal";
import ViabilityReport from "@/components/deep-dive/ViabilityReport";
import BusinessPlanView from "@/components/deep-dive/BusinessPlanView";
import MarketingAssetsView from "@/components/deep-dive/MarketingAssetsView";
import ActionRoadmapView from "@/components/deep-dive/ActionRoadmapView";
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

interface Project {
  id: string;
  idea: Idea;
  profile: UserProfile | null;
  createdAt: string;
  updatedAt: string;
  deepDive: {
    viability: ViabilityReportType | null;
    businessPlan: BusinessPlan | null;
    marketing: MarketingAssets | null;
    roadmap: ActionRoadmap | null;
  } | null;
}

export default function ProjectPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { hasDeepDiveAccess, hasLaunchKitAccess, loading: creditsLoading, refetch: refetchCredits } = useCredits();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("viability");
  const [loadingTab, setLoadingTab] = useState<TabId | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // Payment gate state
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);

  // Launch Kit state
  const [showLaunchKit, setShowLaunchKit] = useState(false);
  const [launchKit, setLaunchKit] = useState<LaunchKit | null>(null);
  const [isGeneratingLaunchKit, setIsGeneratingLaunchKit] = useState(false);
  const [launchKitError, setLaunchKitError] = useState<string | null>(null);
  const [showLaunchKitPurchaseModal, setShowLaunchKitPurchaseModal] = useState(false);

  // Local state for generated content (for tabs generated in this session)
  const [viability, setViability] = useState<ViabilityReportType | null>(null);
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [marketing, setMarketing] = useState<MarketingAssets | null>(null);
  const [roadmap, setRoadmap] = useState<ActionRoadmap | null>(null);

  // Track which tabs have been fetched to prevent duplicate requests
  const fetchedTabs = useRef<Set<TabId>>(new Set());

  // Redirect to builder if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/builder");
    }
  }, [user, authLoading, router]);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      if (!user || !projectId) return;

      try {
        const response = await fetch(`/api/user/projects/${projectId}`);
        const result = await response.json();

        if (result.success) {
          setProject(result.data);
          // Initialize local state with saved deep dive content
          if (result.data.deepDive) {
            if (result.data.deepDive.viability) {
              setViability(result.data.deepDive.viability);
              fetchedTabs.current.add("viability");
            }
            if (result.data.deepDive.businessPlan) {
              setPlan(result.data.deepDive.businessPlan);
              fetchedTabs.current.add("plan");
            }
            if (result.data.deepDive.marketing) {
              setMarketing(result.data.deepDive.marketing);
              fetchedTabs.current.add("marketing");
            }
            if (result.data.deepDive.roadmap) {
              setRoadmap(result.data.deepDive.roadmap);
              fetchedTabs.current.add("roadmap");
            }
          }
        } else if (response.status === 404) {
          setError("Project not found");
        } else {
          setError(result.error || "Failed to load project");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProject();
    }
  }, [user, projectId]);

  // Check for successful purchase return from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseParam = urlParams.get("purchase");
    const sessionId = urlParams.get("session_id");

    if (purchaseParam === "deep_dive" && sessionId) {
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
      // Refetch credits and grant access
      refetchCredits();
      setHasAccess(true);
      setAccessChecked(true);
    }

    if (purchaseParam === "launch_kit" && sessionId) {
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
      // Refetch credits
      refetchCredits();
    }
  }, [refetchCredits]);

  // Check access after project and credits are loaded
  useEffect(() => {
    // Skip if already checked or returning from purchase
    if (accessChecked) return;
    // Skip if still loading
    if (creditsLoading || isLoading || !project) return;

    const ideaId = project.idea.id;
    const canAccess = hasDeepDiveAccess(ideaId);

    setHasAccess(canAccess);
    setAccessChecked(true);

    if (!canAccess) {
      setShowPurchaseModal(true);
    }
  }, [creditsLoading, isLoading, project, hasDeepDiveAccess, accessChecked]);

  // Check if content exists for a tab
  const hasContent = useCallback((tabId: TabId): boolean => {
    switch (tabId) {
      case "viability": return viability !== null;
      case "plan": return plan !== null;
      case "marketing": return marketing !== null;
      case "roadmap": return roadmap !== null;
    }
  }, [viability, plan, marketing, roadmap]);

  // Generate content for a tab
  const generateContent = useCallback(async (tabId: TabId) => {
    if (!project || fetchedTabs.current.has(tabId)) return;

    fetchedTabs.current.add(tabId);
    setLoadingTab(tabId);
    setError(null);

    // Build profile from project data or use defaults
    const profile: UserProfile = project.profile || {
      ventureType: null,
      format: null,
      location: null,
      causes: [],
      experience: null,
      budget: null,
      commitment: null,
      depth: "full",
      hasIdea: true,
      ownIdea: "",
    };

    try {
      const response = await fetch("/api/deep-dive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: project.idea,
          profile,
          section: tabId,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Set content locally
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

        // Save to Supabase
        const saveResponse = await fetch("/api/user/deep-dive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ideaId: project.id,
            [tabId === "plan" ? "businessPlan" : tabId]: result.data,
          }),
        });

        if (!saveResponse.ok) {
          console.error("Failed to save deep dive result");
        }
      } else {
        setError(result.error || "Failed to generate content");
        fetchedTabs.current.delete(tabId);
      }
    } catch (err) {
      console.error("Error generating content:", err);
      setError("Something went wrong. Please try again.");
      fetchedTabs.current.delete(tabId);
    } finally {
      setLoadingTab(null);
    }
  }, [project]);

  // Delete project
  const deleteProject = async () => {
    if (!project) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/user/projects/${project.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/projects");
      } else {
        const result = await response.json();
        setError(result.error || "Failed to delete project");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Download PDF
  const downloadPDF = async () => {
    if (!project) return;

    const hasAnyContent = viability || plan || marketing || roadmap;
    if (!hasAnyContent) return;

    setIsDownloadingPDF(true);
    try {
      const profile: UserProfile = project.profile || {
        ventureType: null,
        format: null,
        location: null,
        causes: [],
        experience: null,
        budget: null,
        commitment: null,
        depth: "full",
        hasIdea: true,
        ownIdea: "",
      };

      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: project.idea,
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

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      link.download = filenameMatch?.[1] || `sparkgood-${project.idea.name.toLowerCase().replace(/\s+/g, "-")}.pdf`;

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

  // Generate Launch Kit
  const handleGenerateLaunchKit = useCallback(async () => {
    if (!project) return;

    setShowLaunchKit(true);
    setLaunchKitError(null);

    // If we already have a launch kit, just show it
    if (launchKit) {
      return;
    }

    setIsGeneratingLaunchKit(true);

    // Build profile from project data or use defaults
    const projectProfile: UserProfile = project.profile || {
      ventureType: null,
      format: null,
      location: null,
      causes: [],
      experience: null,
      budget: null,
      commitment: null,
      depth: "full",
      hasIdea: true,
      ownIdea: "",
    };

    try {
      const response = await fetch("/api/launch-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: project.idea, profile: projectProfile }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setLaunchKit(result.data);
      } else {
        setLaunchKitError(result.error || "Failed to generate launch kit");
      }
    } catch (err) {
      console.error("Error generating launch kit:", err);
      setLaunchKitError("Something went wrong. Please try again.");
    } finally {
      setIsGeneratingLaunchKit(false);
    }
  }, [project, launchKit]);

  // Handle Launch Kit button click
  const handleLaunchKitClick = useCallback(() => {
    if (!project) return;

    // Check if user has access to launch kit for this idea
    const canAccess = hasLaunchKitAccess(project.idea.id);

    if (canAccess) {
      // User has access - generate or show launch kit
      handleGenerateLaunchKit();
    } else {
      // User needs to purchase - show purchase modal
      setShowLaunchKitPurchaseModal(true);
    }
  }, [project, hasLaunchKitAccess, handleGenerateLaunchKit]);

  // Get content for current tab
  const getCurrentContent = () => {
    switch (activeTab) {
      case "viability": return viability;
      case "plan": return plan;
      case "marketing": return marketing;
      case "roadmap": return roadmap;
    }
  };

  const isTabLoading = loadingTab === activeTab;
  const content = getCurrentContent();
  const hasAnyContent = viability || plan || marketing || roadmap;

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-charcoal-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-spark border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Don't render if not logged in (will redirect)
  if (!user) {
    return null;
  }

  // Show loading state while fetching project
  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-dark flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-3 border-spark border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-warmwhite-muted">Loading project...</p>
        </div>
      </div>
    );
  }

  // Show loading state while checking credits
  if (creditsLoading || !accessChecked) {
    return (
      <div className="min-h-screen bg-charcoal-dark flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-3 border-spark border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-warmwhite-muted">Checking access...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !project) {
    return (
      <main className="min-h-screen bg-charcoal-dark">
        <div className="border-b border-warmwhite/10 bg-charcoal-dark/95 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 py-3 md:py-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-xs md:text-sm">✦</span>
              </div>
              <span className="font-display text-warmwhite font-semibold hidden sm:inline text-sm">
                SparkGood
              </span>
            </Link>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 pt-12">
          <FadeIn duration={300}>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Link
                href="/projects"
                className="text-spark hover:underline"
              >
                Back to Projects
              </Link>
            </div>
          </FadeIn>
        </div>
      </main>
    );
  }

  if (!project) {
    return null;
  }

  // Build profile for view components
  const profile: UserProfile = project.profile || {
    ventureType: null,
    format: null,
    location: null,
    causes: [],
    experience: null,
    budget: null,
    commitment: null,
    depth: "full",
    hasIdea: true,
    ownIdea: "",
  };

  return (
    <div className="min-h-screen bg-charcoal-dark">
      {/* Header */}
      <div className="border-b border-warmwhite/10 bg-charcoal-dark/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 md:py-4">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-3 md:gap-4">
              {/* Logo link home */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center transition-transform group-hover:scale-105">
                  <span className="text-xs md:text-sm">✦</span>
                </div>
                <span className="font-display text-warmwhite font-semibold hidden sm:inline text-sm">
                  SparkGood
                </span>
              </Link>

              {/* Divider */}
              <div className="w-px h-5 bg-warmwhite/20 hidden sm:block" />

              {/* Back to projects */}
              <Link
                href="/projects"
                className="flex items-center gap-1.5 text-warmwhite-muted hover:text-warmwhite transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back to Projects</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {/* Launch Kit Button */}
              {hasAccess && (
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
              )}
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

              {/* Delete button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>

          {/* Idea title */}
          <FadeIn duration={400}>
            <div className="mb-4 md:mb-6">
              <h1 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-warmwhite leading-tight">
                {project.idea.name}
              </h1>
              <p className="text-warmwhite-muted mt-1 text-sm md:text-base line-clamp-1 md:line-clamp-none">
                {project.idea.tagline}
              </p>
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
                <span className="hidden sm:inline">{tab.icon}</span>
                {tab.label}
                {hasContent(tab.id) && (
                  <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
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
        {/* Locked state - no access */}
        {!hasAccess && (
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

        {hasAccess && error && (
          <FadeIn duration={300}>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-warmwhite mb-1">Error</h3>
                  <p className="text-warmwhite-muted text-sm">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-3 text-spark hover:text-spark-400 text-sm font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Loading state for generation */}
        {hasAccess && isTabLoading && !content && (
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
                Generating content...
              </p>
              <p className="text-warmwhite-muted text-sm text-center max-w-md">
                We&apos;re researching and analyzing your idea. This takes 15-20 seconds because we&apos;re pulling live information.
              </p>
            </div>
          </FadeIn>
        )}

        {/* Show content or generate button */}
        {hasAccess && !isTabLoading && content && (
          <FadeIn duration={400}>
            {activeTab === "viability" && viability && (
              <ViabilityReport report={viability} />
            )}
            {activeTab === "plan" && plan && (
              <BusinessPlanView plan={plan} profile={profile} />
            )}
            {activeTab === "marketing" && marketing && (
              <MarketingAssetsView assets={marketing} ideaName={project.idea.name} />
            )}
            {activeTab === "roadmap" && roadmap && (
              <ActionRoadmapView roadmap={roadmap} idea={project.idea} profile={profile} />
            )}
          </FadeIn>
        )}

        {/* Generate button for empty tabs */}
        {hasAccess && !isTabLoading && !content && (
          <FadeIn duration={400}>
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-charcoal-light flex items-center justify-center mx-auto mb-6">
                {tabs.find(t => t.id === activeTab)?.icon}
              </div>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-3">
                {activeTab === "viability" && "Market Viability Analysis"}
                {activeTab === "plan" && "Business Plan"}
                {activeTab === "marketing" && "Marketing Assets"}
                {activeTab === "roadmap" && "Action Roadmap"}
              </h2>
              <p className="text-warmwhite-muted mb-8 max-w-md mx-auto">
                {activeTab === "viability" && "Get real market research, competitor analysis, and a viability score for your idea."}
                {activeTab === "plan" && "Generate a complete business plan with mission, revenue streams, and impact metrics."}
                {activeTab === "marketing" && "Create marketing assets including social posts, email templates, and landing page copy."}
                {activeTab === "roadmap" && "Get a personalized action plan with quick wins and phased milestones."}
              </p>
              <button
                onClick={() => generateContent(activeTab)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-spark text-charcoal-dark font-semibold rounded-full hover:bg-spark-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate {tabs.find(t => t.id === activeTab)?.label}
              </button>
            </div>
          </FadeIn>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <FadeIn duration={200}>
            <div className="bg-charcoal-light border border-warmwhite/10 rounded-2xl p-6 max-w-md w-full">
              <h3 className="font-display text-xl font-bold text-warmwhite mb-3">
                Delete Project?
              </h3>
              <p className="text-warmwhite-muted mb-6">
                This will permanently delete &quot;{project.idea.name}&quot; and all generated content. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-warmwhite/20 text-warmwhite hover:bg-warmwhite/5 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteProject}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    "Delete Project"
                  )}
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      )}

      {/* Purchase Modal for deep dive access */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => {
          setShowPurchaseModal(false);
          // If user closes without purchasing, go back to projects
          if (!hasAccess) {
            router.push("/projects");
          }
        }}
        ideaId={project.idea.id}
        ideaName={project.idea.name}
        purchaseType="deep_dive"
      />

      {/* Launch Kit Modal */}
      <LaunchKitModal
        isOpen={showLaunchKit}
        onClose={() => setShowLaunchKit(false)}
        launchKit={launchKit}
        isLoading={isGeneratingLaunchKit}
        error={launchKitError}
        ideaName={project.idea.name}
      />

      {/* Purchase Modal for launch kit */}
      <PurchaseModal
        isOpen={showLaunchKitPurchaseModal}
        onClose={() => setShowLaunchKitPurchaseModal(false)}
        ideaId={project.idea.id}
        ideaName={project.idea.name}
        purchaseType="launch_kit"
        hasDeepDive={hasAccess}
      />
    </div>
  );
}
