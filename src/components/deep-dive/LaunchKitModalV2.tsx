"use client";

import { useState, useEffect } from "react";
import type { LaunchKit } from "@/types";

// Component to fetch and render landing page HTML via srcdoc to avoid iframe blocking
function LandingPagePreview({ url }: { url: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHtml = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch landing page");
        }
        const text = await response.text();
        setHtml(text);
      } catch (err) {
        console.error("Error fetching landing page HTML:", err);
        setError("Could not load preview");
      } finally {
        setLoading(false);
      }
    };

    fetchHtml();
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-gray-500">Loading preview...</div>
      </div>
    );
  }

  if (error || !html) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-gray-500">{error || "Preview unavailable"}</div>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      className="w-full h-full border-0"
      title="Landing Page Preview"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}

type TabId = "landing" | "deck" | "graphics" | "onepager" | "text";

// V2 Launch Kit Assets structure from API
interface LaunchKitV2Assets {
  textContent?: {
    elevatorPitch: string;
    socialPosts: Record<string, { content: string; hashtags?: string[] }>;
    emailSequence: {
      email1: { subject: string; body: string };
      email2: { subject: string; body: string };
      email3: { subject: string; body: string };
    };
    landingPageCopy?: {
      headline: string;
      subheadline: string;
    };
  } | null;
  pitchDeck?: {
    url: string;
    storagePath: string;
  };
  socialGraphics?: Array<{
    platform: string;
    url: string;
    storagePath: string;
    dimensions: { width: number; height: number };
  }>;
  onePager?: {
    url: string;
    storagePath: string;
  };
  landingPage?: {
    url: string;
    hostedUrl: string;
    storagePath: string;
    slug: string;
  };
  failedAssets?: string[]; // Track which assets failed to generate
}

interface LaunchKitModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  // Support both V1 LaunchKit and V2 assets
  launchKit?: LaunchKit | null;
  launchKitV2?: LaunchKitV2Assets | null;
  isLoading: boolean;
  error: string | null;
  ideaName: string;
  failedAssets?: string[]; // List of assets that failed to generate
  onRegenerate?: () => void; // Callback to regenerate failed assets
}

export default function LaunchKitModalV2({
  isOpen,
  onClose,
  launchKit,
  launchKitV2,
  isLoading,
  error,
  ideaName,
  failedAssets = [],
  onRegenerate,
}: LaunchKitModalV2Props) {
  const [activeTab, setActiveTab] = useState<TabId>("landing");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Use V2 assets if available, otherwise fall back to V1
  const isV2 = !!launchKitV2;
  const assets = launchKitV2;

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadFromUrl = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllGraphics = async () => {
    if (!assets?.socialGraphics) return;

    for (const graphic of assets.socialGraphics) {
      downloadFromUrl(graphic.url, `${ideaName.toLowerCase().replace(/\s+/g, "-")}-${graphic.platform}.png`);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
        bg-charcoal-dark hover:bg-charcoal-dark/80 text-warmwhite-muted hover:text-warmwhite transition-colors"
    >
      {copiedField === field ? (
        <>
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          Copy
        </>
      )}
    </button>
  );

  const DownloadButton = ({ url, filename, label }: { url: string; filename: string; label: string }) => (
    <button
      onClick={() => downloadFromUrl(url, filename)}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
        bg-spark/10 hover:bg-spark/20 text-spark transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {label}
    </button>
  );

  // Map tab IDs to their corresponding failedAssets keys
  const tabToAssetKey: Record<TabId, string> = {
    landing: "landingPage",
    deck: "pitchDeck",
    graphics: "socialGraphics",
    onepager: "onePager",
    text: "textContent",
  };

  // Check if a tab's asset failed to generate
  const isTabFailed = (tabId: TabId): boolean => {
    return failedAssets.includes(tabToAssetKey[tabId]);
  };

  // Error message component for failed tabs
  const FailedAssetMessage = ({ assetName }: { assetName: string }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h4 className="text-lg font-medium text-warmwhite mb-2">Generation Failed</h4>
      <p className="text-warmwhite-muted text-sm max-w-md mb-6">
        {assetName} couldn&apos;t be generated. This may be due to high demand.
      </p>
      {onRegenerate && (
        <button
          onClick={onRegenerate}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl
            bg-spark hover:bg-spark/90 text-charcoal-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Regenerate Assets
        </button>
      )}
    </div>
  );

  const tabs: { id: TabId; label: string; icon: React.ReactNode; available: boolean; failed: boolean }[] = [
    {
      id: "landing",
      label: "Landing Page",
      available: (isV2 ? !!assets?.landingPage : !!launchKit?.landingPage) || isTabFailed("landing"),
      failed: isTabFailed("landing"),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
    },
    {
      id: "deck",
      label: "Pitch Deck",
      available: !!assets?.pitchDeck || isTabFailed("deck"),
      failed: isTabFailed("deck"),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
        </svg>
      ),
    },
    {
      id: "graphics",
      label: "Social Graphics",
      available: (!!assets?.socialGraphics && assets.socialGraphics.length > 0) || isTabFailed("graphics"),
      failed: isTabFailed("graphics"),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
    },
    {
      id: "onepager",
      label: "One-Pager",
      available: !!assets?.onePager || isTabFailed("onepager"),
      failed: isTabFailed("onepager"),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      id: "text",
      label: "Text Content",
      available: (isV2 ? !!assets?.textContent : !!launchKit) || isTabFailed("text"),
      failed: isTabFailed("text"),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
    },
  ];

  // Filter to only show available tabs (includes failed ones so user can see the error)
  const availableTabs = tabs.filter(t => t.available);

  // Reset to first available tab when modal opens
  useEffect(() => {
    if (isOpen && availableTabs.length > 0 && !availableTabs.find(t => t.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [isOpen, availableTabs, activeTab]);

  if (!isOpen) return null;

  const slugify = (str: string) => str.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-charcoal-dark border border-warmwhite/10 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-warmwhite/10">
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-warmwhite">
              Launch Kit
            </h2>
            <p className="text-warmwhite-muted text-sm mt-1">
              Professional assets for {ideaName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Show regenerate button when there are failed assets */}
            {failedAssets.length > 0 && onRegenerate && !isLoading && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                  bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Regenerate ({failedAssets.length} failed)
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-warmwhite-muted hover:text-warmwhite transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b border-warmwhite/10 overflow-x-auto scrollbar-hide">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all
                ${activeTab === tab.id
                  ? "bg-spark/10 text-spark"
                  : "text-warmwhite-muted hover:text-warmwhite hover:bg-charcoal-light/50"
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-charcoal-light" />
                <svg className="absolute inset-0 w-16 h-16 -rotate-90 animate-spin">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="url(#kitSpinGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="60 200"
                  />
                  <defs>
                    <linearGradient id="kitSpinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#F97316" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <p className="text-warmwhite font-medium mb-2">Generating your Launch Kit...</p>
              <p className="text-warmwhite-muted text-sm text-center max-w-md">
                Creating landing page, pitch deck, social graphics, one-pager, and marketing content. This may take 30-60 seconds.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
              <p className="text-red-400 font-medium mb-2">Failed to generate Launch Kit</p>
              <p className="text-warmwhite-muted text-sm">{error}</p>
            </div>
          )}

          {(assets || launchKit) && !isLoading && !error && (
            <>
              {/* Landing Page Tab - Failed */}
              {activeTab === "landing" && isTabFailed("landing") && (
                <FailedAssetMessage assetName="Landing Page" />
              )}
              {/* Landing Page Tab */}
              {activeTab === "landing" && !isTabFailed("landing") && assets?.landingPage && (
                <div className="space-y-4">
                  {/* Hosted URL banner */}
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h4 className="font-medium text-green-400 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Your page is live!
                        </h4>
                        <p className="text-warmwhite-muted text-sm mt-1 break-all">
                          {assets.landingPage.hostedUrl}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(assets.landingPage!.hostedUrl, "_blank")}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg
                            bg-green-500 hover:bg-green-600 text-white transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                          Visit Your Page
                        </button>
                        <CopyButton text={assets.landingPage.hostedUrl} field="hosted-url" />
                      </div>
                    </div>
                  </div>

                  {/* Preview - render HTML directly to avoid iframe issues */}
                  <div className="bg-charcoal-light rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-3 border-b border-warmwhite/10">
                      <span className="text-sm text-warmwhite-muted">Preview</span>
                      <DownloadButton
                        url={assets.landingPage.url}
                        filename={`${slugify(ideaName)}-landing-page.html`}
                        label="Download HTML"
                      />
                    </div>
                    <div className="relative h-[400px] bg-white overflow-auto">
                      {/* Use an iframe with srcdoc to render the landing page HTML directly */}
                      {/* This avoids X-Frame-Options issues since we're not loading from a URL */}
                      <LandingPagePreview url={assets.landingPage.url} />
                    </div>
                  </div>
                </div>
              )}

              {/* V1 Landing Page fallback */}
              {activeTab === "landing" && !assets?.landingPage && launchKit?.landingPage && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-warmwhite">Landing Page HTML</h3>
                    <CopyButton text={launchKit.landingPage.html} field="landing-html" />
                  </div>
                  <div className="bg-charcoal-light rounded-xl p-4 overflow-x-auto max-h-[400px]">
                    <pre className="text-warmwhite-muted text-sm whitespace-pre-wrap font-mono">
                      {launchKit.landingPage.html}
                    </pre>
                  </div>
                </div>
              )}

              {/* Pitch Deck Tab - Failed */}
              {activeTab === "deck" && isTabFailed("deck") && (
                <FailedAssetMessage assetName="Pitch Deck" />
              )}
              {/* Pitch Deck Tab */}
              {activeTab === "deck" && !isTabFailed("deck") && assets?.pitchDeck && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-warmwhite">Investor Pitch Deck</h3>
                    <DownloadButton
                      url={assets.pitchDeck.url}
                      filename={`${slugify(ideaName)}-pitch-deck.pptx`}
                      label="Download PPTX"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-spark/5 to-accent/5 border border-spark/20 rounded-2xl p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-spark/10 rounded-2xl flex items-center justify-center">
                      <svg className="w-10 h-10 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-warmwhite mb-2">7-Slide Pitch Deck</h4>
                    <p className="text-warmwhite-muted mb-6 max-w-md mx-auto">
                      Professional PowerPoint presentation with Cover, Opportunity, Solution, Market Validation, Competitive Landscape, Financial Projections, and The Ask.
                    </p>
                    <button
                      onClick={() => downloadFromUrl(assets.pitchDeck!.url, `${slugify(ideaName)}-pitch-deck.pptx`)}
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl
                        bg-spark hover:bg-spark/90 text-charcoal-dark transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PowerPoint
                    </button>
                  </div>
                </div>
              )}

              {/* Social Graphics Tab - Failed */}
              {activeTab === "graphics" && isTabFailed("graphics") && (
                <FailedAssetMessage assetName="Social Graphics" />
              )}
              {/* Social Graphics Tab */}
              {activeTab === "graphics" && !isTabFailed("graphics") && assets?.socialGraphics && assets.socialGraphics.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-warmwhite">Social Media Graphics</h3>
                    <button
                      onClick={downloadAllGraphics}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg
                        bg-spark hover:bg-spark/90 text-charcoal-dark transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download All
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {assets.socialGraphics.map((graphic) => (
                      <div
                        key={graphic.platform}
                        className="bg-charcoal-light rounded-xl overflow-hidden"
                      >
                        <div className="aspect-square relative bg-charcoal-dark">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={graphic.url}
                            alt={`${graphic.platform} graphic`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-warmwhite capitalize">{graphic.platform.replace("_", " ")}</p>
                            <p className="text-xs text-warmwhite-dim">
                              {graphic.dimensions.width} × {graphic.dimensions.height}
                            </p>
                          </div>
                          <button
                            onClick={() => downloadFromUrl(graphic.url, `${slugify(ideaName)}-${graphic.platform}.png`)}
                            className="p-2 text-spark hover:bg-spark/10 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* One-Pager Tab - Failed */}
              {activeTab === "onepager" && isTabFailed("onepager") && (
                <FailedAssetMessage assetName="One-Pager PDF" />
              )}
              {/* One-Pager Tab */}
              {activeTab === "onepager" && !isTabFailed("onepager") && assets?.onePager && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-warmwhite">Business One-Pager</h3>
                    <DownloadButton
                      url={assets.onePager.url}
                      filename={`${slugify(ideaName)}-one-pager.pdf`}
                      label="Download PDF"
                    />
                  </div>

                  <div className="bg-charcoal-light rounded-xl overflow-hidden">
                    <div className="relative h-[600px]">
                      <iframe
                        src={assets.onePager.url}
                        className="w-full h-full border-0"
                        title="One-Pager PDF Preview"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Text Content Tab - Failed */}
              {activeTab === "text" && isTabFailed("text") && (
                <FailedAssetMessage assetName="Text Content" />
              )}
              {/* Text Content Tab */}
              {activeTab === "text" && !isTabFailed("text") && (
                <div className="space-y-6">
                  {/* Elevator Pitch */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-warmwhite">Elevator Pitch</h3>
                      <CopyButton
                        text={assets?.textContent?.elevatorPitch || launchKit?.elevatorPitch || ""}
                        field="pitch"
                      />
                    </div>
                    <div className="bg-gradient-to-br from-spark/10 to-accent/5 border border-spark/20 rounded-xl p-5">
                      <p className="text-warmwhite leading-relaxed italic">
                        &ldquo;{assets?.textContent?.elevatorPitch || launchKit?.elevatorPitch}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Social Posts */}
                  <div className="space-y-3">
                    <h3 className="font-display text-lg font-bold text-warmwhite">Social Posts</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {Object.entries(assets?.textContent?.socialPosts || launchKit?.socialPosts || {}).map(([platform, post]) => (
                        <div key={platform} className="bg-charcoal-light rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-warmwhite capitalize text-sm">{platform}</span>
                            <CopyButton text={post.content} field={`social-${platform}`} />
                          </div>
                          <p className="text-warmwhite-muted text-sm whitespace-pre-line line-clamp-4">
                            {post.content}
                          </p>
                          {post.hashtags && post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {post.hashtags.slice(0, 4).map((tag: string, i: number) => (
                                <span key={i} className="text-xs text-spark">#{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Email Sequence */}
                  <div className="space-y-3">
                    <h3 className="font-display text-lg font-bold text-warmwhite">Email Sequence</h3>
                    <div className="space-y-3">
                      {[
                        { key: "email1", label: "Welcome", email: assets?.textContent?.emailSequence?.email1 || launchKit?.emailSequence?.email1 },
                        { key: "email2", label: "Value", email: assets?.textContent?.emailSequence?.email2 || launchKit?.emailSequence?.email2 },
                        { key: "email3", label: "CTA", email: assets?.textContent?.emailSequence?.email3 || launchKit?.emailSequence?.email3 },
                      ].map(({ key, label, email }) => email && (
                        <div key={key} className="bg-charcoal-light rounded-xl overflow-hidden">
                          <div className="border-b border-warmwhite/10 p-3 flex items-center justify-between">
                            <div>
                              <span className="font-medium text-warmwhite text-sm">{label}</span>
                              <span className="text-warmwhite-dim text-xs ml-2">Subject: {email.subject}</span>
                            </div>
                            <CopyButton text={`Subject: ${email.subject}\n\n${email.body}`} field={key} />
                          </div>
                          <div className="p-3">
                            <p className="text-warmwhite-muted text-sm whitespace-pre-line line-clamp-3">{email.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
