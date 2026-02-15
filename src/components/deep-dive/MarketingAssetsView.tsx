"use client";

import { useState } from "react";
import type { MarketingAssets } from "@/types";

interface MarketingAssetsViewProps {
  assets: MarketingAssets;
  ideaName: string;
}

export default function MarketingAssetsView({ assets, ideaName }: MarketingAssetsViewProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="flex items-center gap-1 text-xs text-warmwhite-dim hover:text-spark transition-colors"
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

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case "linkedin":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        );
      case "instagram":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Copy Section */}
      <div className="bg-gradient-to-br from-spark/10 to-accent/5 border border-spark/20 rounded-2xl p-6 md:p-8">
        <h2 className="font-display text-2xl font-bold text-warmwhite mb-6">Core Messaging</h2>

        <div className="space-y-6">
          {/* Tagline */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-warmwhite-dim uppercase tracking-wider">Tagline</h3>
              <CopyButton text={assets.tagline} field="tagline" />
            </div>
            <p className="text-2xl md:text-3xl font-display font-bold text-spark">{assets.tagline}</p>
          </div>

          {/* Landing Page Headline */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-warmwhite-dim uppercase tracking-wider">Headline</h3>
              <CopyButton text={assets.landingPageHeadline} field="headline" />
            </div>
            <p className="text-xl md:text-2xl font-display text-warmwhite">{assets.landingPageHeadline}</p>
          </div>

          {/* Subheadline */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-warmwhite-dim uppercase tracking-wider">Subheadline</h3>
              <CopyButton text={assets.landingPageSubheadline} field="subheadline" />
            </div>
            <p className="text-warmwhite-muted">{assets.landingPageSubheadline}</p>
          </div>

          {/* CTA */}
          <div>
            <h3 className="text-sm font-medium text-warmwhite-dim uppercase tracking-wider mb-2">Primary CTA</h3>
            <span className="inline-flex items-center px-6 py-3 bg-spark text-charcoal-dark font-medium rounded-full">
              {assets.primaryCTA}
            </span>
          </div>
        </div>
      </div>

      {/* Elevator Pitch */}
      <div className="bg-charcoal-light rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-warmwhite flex items-center gap-2">
            <svg className="w-6 h-6 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            30-Second Elevator Pitch
          </h2>
          <CopyButton text={assets.elevatorPitch} field="pitch" />
        </div>
        <div className="bg-charcoal-dark rounded-xl p-5">
          <p className="text-warmwhite leading-relaxed italic">&ldquo;{assets.elevatorPitch}&rdquo;</p>
        </div>
        <p className="text-xs text-warmwhite-dim mt-3">Use this when someone asks &ldquo;What do you do?&rdquo; at networking events, in social bios, or quick introductions.</p>
      </div>

      {/* Social Media Posts */}
      <div className="bg-charcoal-light rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold text-warmwhite mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          Social Media Launch Posts
        </h2>
        <div className="space-y-4">
          {assets.socialPosts.map((post, i) => (
            <div key={i} className="bg-charcoal-dark rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`
                    p-2 rounded-lg
                    ${post.platform === "twitter" ? "bg-black text-white" : ""}
                    ${post.platform === "linkedin" ? "bg-[#0A66C2] text-white" : ""}
                    ${post.platform === "instagram" ? "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white" : ""}
                  `}>
                    {getPlatformIcon(post.platform)}
                  </span>
                  <span className="font-medium text-warmwhite capitalize">{post.platform}</span>
                </div>
                <CopyButton text={post.content} field={`social-${post.platform}`} />
              </div>
              <p className="text-warmwhite-muted text-sm whitespace-pre-line mb-4">{post.content}</p>
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag, j) => (
                  <span key={j} className="text-xs text-spark">#{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Template */}
      <div className="bg-charcoal-light rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold text-warmwhite mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          Email Template
        </h2>
        <div className="bg-charcoal-dark rounded-xl overflow-hidden">
          <div className="border-b border-warmwhite/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-warmwhite-dim">Subject:</span>
                <p className="text-warmwhite font-medium">{assets.emailTemplate.subject}</p>
              </div>
              <CopyButton text={`Subject: ${assets.emailTemplate.subject}\n\n${assets.emailTemplate.body}`} field="email" />
            </div>
          </div>
          <div className="p-5">
            <p className="text-warmwhite-muted text-sm whitespace-pre-line leading-relaxed">{assets.emailTemplate.body}</p>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-spark/10 border border-spark/20 rounded-2xl p-6">
        <h3 className="font-display text-lg font-bold text-spark mb-4">Quick Tips</h3>
        <ul className="space-y-2 text-sm text-warmwhite-muted">
          <li className="flex items-start gap-2">
            <span className="text-spark mt-0.5">1.</span>
            Customize the [bracketed] placeholders with your specific details
          </li>
          <li className="flex items-start gap-2">
            <span className="text-spark mt-0.5">2.</span>
            Post on different platforms at different times — don&apos;t spam all at once
          </li>
          <li className="flex items-start gap-2">
            <span className="text-spark mt-0.5">3.</span>
            Respond to every comment and message, especially in the first week
          </li>
          <li className="flex items-start gap-2">
            <span className="text-spark mt-0.5">4.</span>
            Ask early supporters to share — personal shares outperform brand posts
          </li>
        </ul>
      </div>
    </div>
  );
}
