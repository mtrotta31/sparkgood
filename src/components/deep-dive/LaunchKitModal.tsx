"use client";

import { useState, useEffect } from "react";
import type { LaunchKit } from "@/types";

type TabId = "landing" | "social" | "emails" | "pitch";

interface LaunchKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  launchKit: LaunchKit | null;
  isLoading: boolean;
  error: string | null;
  ideaName: string;
}

export default function LaunchKitModal({
  isOpen,
  onClose,
  launchKit,
  isLoading,
  error,
  ideaName,
}: LaunchKitModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("landing");
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const downloadAsFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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

  const DownloadButton = ({ content, filename, type, label }: { content: string; filename: string; type: string; label: string }) => (
    <button
      onClick={() => downloadAsFile(content, filename, type)}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
        bg-spark/10 hover:bg-spark/20 text-spark transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {label}
    </button>
  );

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    {
      id: "landing",
      label: "Landing Page",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
    },
    {
      id: "social",
      label: "Social Posts",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
      ),
    },
    {
      id: "emails",
      label: "Email Sequence",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
    },
    {
      id: "pitch",
      label: "Elevator Pitch",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-charcoal-dark border border-warmwhite/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-warmwhite/10">
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-warmwhite">
              Launch Kit
            </h2>
            <p className="text-warmwhite-muted text-sm mt-1">
              Complete marketing package for {ideaName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-warmwhite-muted hover:text-warmwhite transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b border-warmwhite/10 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
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
                Creating landing page, social posts, email sequence, and elevator pitch. This takes 20-30 seconds.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
              <p className="text-red-400 font-medium mb-2">Failed to generate Launch Kit</p>
              <p className="text-warmwhite-muted text-sm">{error}</p>
            </div>
          )}

          {launchKit && !isLoading && (
            <>
              {/* Landing Page Tab */}
              {activeTab === "landing" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-warmwhite">Landing Page HTML</h3>
                    <div className="flex gap-2">
                      <CopyButton text={launchKit.landingPage.html} field="landing-html" />
                      <DownloadButton
                        content={launchKit.landingPage.html}
                        filename={`${ideaName.toLowerCase().replace(/\s+/g, "-")}-landing-page.html`}
                        type="text/html"
                        label="Download HTML"
                      />
                    </div>
                  </div>
                  <div className="bg-charcoal-light rounded-xl p-4 overflow-x-auto">
                    <pre className="text-warmwhite-muted text-sm whitespace-pre-wrap font-mono">
                      {launchKit.landingPage.html}
                    </pre>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-charcoal-light rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-warmwhite-dim uppercase">Headline</h4>
                        <CopyButton text={launchKit.landingPage.headline} field="headline" />
                      </div>
                      <p className="text-warmwhite font-medium">{launchKit.landingPage.headline}</p>
                    </div>
                    <div className="bg-charcoal-light rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-warmwhite-dim uppercase">Subheadline</h4>
                        <CopyButton text={launchKit.landingPage.subheadline} field="subheadline" />
                      </div>
                      <p className="text-warmwhite-muted">{launchKit.landingPage.subheadline}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Posts Tab */}
              {activeTab === "social" && (
                <div className="space-y-4">
                  {Object.entries(launchKit.socialPosts).map(([platform, post]) => (
                    <div key={platform} className="bg-charcoal-light rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`
                            p-2 rounded-lg text-white
                            ${platform === "linkedin" ? "bg-[#0A66C2]" : ""}
                            ${platform === "twitter" ? "bg-black" : ""}
                            ${platform === "instagram" ? "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]" : ""}
                            ${platform === "nextdoor" ? "bg-[#00B636]" : ""}
                          `}>
                            {platform === "linkedin" && (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                              </svg>
                            )}
                            {platform === "twitter" && (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                            )}
                            {platform === "instagram" && (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                              </svg>
                            )}
                            {platform === "nextdoor" && (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                              </svg>
                            )}
                          </span>
                          <span className="font-medium text-warmwhite capitalize">{platform}</span>
                        </div>
                        <CopyButton text={post.content} field={`social-${platform}`} />
                      </div>
                      <p className="text-warmwhite-muted text-sm whitespace-pre-line mb-3">{post.content}</p>
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.hashtags.map((tag: string, i: number) => (
                            <span key={i} className="text-xs text-spark">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Email Sequence Tab */}
              {activeTab === "emails" && (
                <div className="space-y-4">
                  {[
                    { key: "email1", label: "Email 1: Welcome", email: launchKit.emailSequence.email1 },
                    { key: "email2", label: "Email 2: Value", email: launchKit.emailSequence.email2 },
                    { key: "email3", label: "Email 3: Call to Action", email: launchKit.emailSequence.email3 },
                  ].map(({ key, label, email }) => (
                    <div key={key} className="bg-charcoal-light rounded-xl overflow-hidden">
                      <div className="border-b border-warmwhite/10 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-warmwhite">{label}</h4>
                            <p className="text-sm text-warmwhite-dim mt-1">Subject: {email.subject}</p>
                          </div>
                          <CopyButton text={`Subject: ${email.subject}\n\n${email.body}`} field={key} />
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-warmwhite-muted text-sm whitespace-pre-line">{email.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Elevator Pitch Tab */}
              {activeTab === "pitch" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-warmwhite">30-Second Elevator Pitch</h3>
                    <CopyButton text={launchKit.elevatorPitch} field="pitch" />
                  </div>
                  <div className="bg-gradient-to-br from-spark/10 to-accent/5 border border-spark/20 rounded-2xl p-6">
                    <p className="text-warmwhite text-lg leading-relaxed italic">
                      &ldquo;{launchKit.elevatorPitch}&rdquo;
                    </p>
                  </div>
                  <p className="text-warmwhite-dim text-sm">
                    Use this when someone asks &ldquo;What do you do?&rdquo; at networking events, in social bios, or quick introductions.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
