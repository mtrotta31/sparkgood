"use client";

import { useState, useRef, useEffect } from "react";
import { FadeIn } from "@/components/ui";
import type { GeneratedAsset, AssetType } from "@/types/assets";
import { getAssetTypeName } from "@/types/assets";

interface BuildAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: GeneratedAsset | null;
  isLoading: boolean;
  error: string | null;
  taskDescription: string;
}

export default function BuildAssetModal({
  isOpen,
  onClose,
  asset,
  isLoading,
  error,
  taskDescription,
}: BuildAssetModalProps) {
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLPreElement>(null);

  // Reset copied state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDownloadable = asset?.type === "landing_page";
  const isPreviewable = asset?.type === "landing_page";

  const handleCopy = async () => {
    if (!asset) return;

    try {
      // For emails, include the subject line
      let textToCopy = asset.content;
      if (asset.type === "email" && asset.metadata?.subject) {
        textToCopy = `Subject: ${asset.metadata.subject}\n\n${asset.content.replace(/^Subject:.*\n\n?/, '')}`;
      }

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    if (!asset) return;

    const filename = asset.metadata?.filename || `${asset.type}-${Date.now()}.${asset.type === "landing_page" ? "html" : "txt"}`;
    const mimeType = asset.type === "landing_page" ? "text/html" : "text/plain";

    const blob = new Blob([asset.content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreview = () => {
    if (!asset || asset.type !== "landing_page") return;

    // Open in new tab
    const blob = new Blob([asset.content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  // Format content for display
  const formatContent = (content: string, type: AssetType): string => {
    if (type === "landing_page") {
      // For HTML, show a truncated preview
      if (content.length > 2000) {
        return content.substring(0, 2000) + "\n\n... [Full HTML continues - click Download to get the complete file]";
      }
    }
    return content;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <FadeIn duration={200}>
        <div className="relative bg-charcoal-dark border border-warmwhite/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-warmwhite/10">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-warmwhite">
                {isLoading ? "Building..." : asset ? asset.title : "Build Asset"}
              </h2>
              {asset && (
                <p className="text-warmwhite-muted text-sm mt-1">
                  {getAssetTypeName(asset.type)}
                  {asset.metadata?.wordCount && ` • ~${asset.metadata.wordCount} words`}
                  {asset.metadata?.platform && ` • ${asset.metadata.platform}`}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-charcoal-light flex items-center justify-center text-warmwhite-muted hover:text-warmwhite hover:bg-charcoal-light/80 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
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
                      stroke="url(#buildGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="60 200"
                    />
                    <defs>
                      <linearGradient id="buildGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#F97316" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <p className="text-warmwhite font-medium mb-2">Building your asset...</p>
                <p className="text-warmwhite-muted text-sm text-center max-w-md">
                  {taskDescription.length > 100
                    ? taskDescription.substring(0, 100) + "..."
                    : taskDescription}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-warmwhite mb-1">Error building asset</h3>
                    <p className="text-warmwhite-muted text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {asset && !isLoading && (
              <div className="space-y-4">
                {/* Subject line for emails */}
                {asset.type === "email" && asset.metadata?.subject && (
                  <div className="bg-spark/10 border border-spark/20 rounded-lg p-3">
                    <span className="text-spark text-sm font-medium">Subject: </span>
                    <span className="text-warmwhite">{asset.metadata.subject}</span>
                  </div>
                )}

                {/* Hashtags for social posts */}
                {asset.metadata?.hashtags && asset.metadata.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {asset.metadata.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-spark text-sm bg-spark/10 px-2 py-1 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Content */}
                <div className="relative">
                  <pre
                    ref={contentRef}
                    className="bg-charcoal-light rounded-xl p-4 md:p-6 text-warmwhite text-sm overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed"
                  >
                    {formatContent(asset.content, asset.type)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer with actions */}
          {asset && !isLoading && (
            <div className="flex flex-wrap gap-3 p-4 md:p-6 border-t border-warmwhite/10 bg-charcoal-dark/50">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  copied
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-spark text-charcoal-dark hover:bg-spark-400"
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>

              {isDownloadable && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-charcoal-light text-warmwhite hover:bg-charcoal-light/80 transition-colors border border-warmwhite/10"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download HTML
                </button>
              )}

              {isPreviewable && (
                <button
                  onClick={handlePreview}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-charcoal-light text-warmwhite hover:bg-charcoal-light/80 transition-colors border border-warmwhite/10"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview
                </button>
              )}

              <button
                onClick={onClose}
                className="ml-auto px-4 py-2.5 rounded-lg font-medium text-warmwhite-muted hover:text-warmwhite transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
