"use client";

import { useState, useCallback } from "react";
import type {
  GrowthPlanData,
  SocialMediaPost,
  GrowthEmailTemplate,
  LocalMarketingTactic,
} from "@/types";

interface GrowthPlanProps {
  data: GrowthPlanData;
  isLoading?: boolean;
}

// Copy button component with feedback
function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
        ${copied
          ? "bg-green-500/20 text-green-400 border border-green-500/30"
          : "bg-spark/10 text-spark hover:bg-spark/20 border border-spark/30"
        }
      `}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

// Platform icons
function PlatformIcon({ platform }: { platform: SocialMediaPost["platform"] }) {
  const iconMap = {
    instagram: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    linkedin: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    ),
    twitter: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    tiktok: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
    facebook: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    nextdoor: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
      </svg>
    ),
  };

  const colors = {
    instagram: "text-pink-400",
    linkedin: "text-blue-400",
    twitter: "text-white",
    tiktok: "text-white",
    facebook: "text-blue-500",
    nextdoor: "text-green-400",
  };

  return (
    <span className={colors[platform]}>
      {iconMap[platform]}
    </span>
  );
}

// Elevator Pitch Section
function ElevatorPitchSection({ pitch }: { pitch: string }) {
  return (
    <div className="bg-gradient-to-br from-spark/10 to-accent/10 border border-spark/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-spark/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-warmwhite">Elevator Pitch</h2>
        </div>
        <CopyButton text={pitch} />
      </div>
      <p className="text-warmwhite leading-relaxed text-lg italic">&ldquo;{pitch}&rdquo;</p>
      <p className="text-warmwhite-dim text-sm mt-3">Practice saying this in under 30 seconds.</p>
    </div>
  );
}

// Landing Page Copy Section
function LandingPageSection({ data }: { data?: GrowthPlanData["landingPageCopy"] }) {
  if (!data) return null;

  const benefits = data.benefits ?? [];
  const faq = data.faq ?? [];

  const fullCopy = `
# ${data.headline ?? ""}

${data.subheadline ?? ""}

## Benefits

${benefits.map(b => `### ${b?.title ?? ""}\n${b?.description ?? ""}`).join('\n\n')}

## About

${data.aboutSection ?? ""}

## FAQ

${faq.map(f => `**${f?.question ?? ""}**\n${f?.answer ?? ""}`).join('\n\n')}

[${data.ctaButtonText ?? "Get Started"}]
  `.trim();

  return (
    <div className="bg-charcoal-light rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-spark/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-warmwhite">Landing Page Copy</h2>
        </div>
        <CopyButton text={fullCopy} label="Copy All" />
      </div>

      {/* Headline */}
      {data.headline && (
        <div className="bg-charcoal-dark rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-warmwhite-dim uppercase tracking-wider">Headline</span>
            <CopyButton text={data.headline} />
          </div>
          <p className="font-display text-2xl font-bold text-warmwhite">{data.headline}</p>
        </div>
      )}

      {/* Subheadline */}
      {data.subheadline && (
        <div className="bg-charcoal-dark rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-warmwhite-dim uppercase tracking-wider">Subheadline</span>
            <CopyButton text={data.subheadline} />
          </div>
          <p className="text-warmwhite-muted text-lg">{data.subheadline}</p>
        </div>
      )}

      {/* Benefits */}
      {benefits.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-warmwhite mb-3">Benefits</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {benefits.map((benefit, i) => (
              <div key={i} className="bg-charcoal-dark rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-warmwhite text-sm">{benefit?.title ?? ""}</span>
                  <CopyButton text={`${benefit?.title ?? ""}\n${benefit?.description ?? ""}`} />
                </div>
                <p className="text-warmwhite-muted text-sm">{benefit?.description ?? ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {data.ctaButtonText && (
        <div className="bg-charcoal-dark rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-warmwhite-dim uppercase tracking-wider">CTA Button</span>
            <CopyButton text={data.ctaButtonText} />
          </div>
          <span className="inline-block px-6 py-2 bg-spark text-charcoal-dark font-bold rounded-lg">
            {data.ctaButtonText}
          </span>
        </div>
      )}

      {/* About */}
      {data.aboutSection && (
        <div className="bg-charcoal-dark rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-warmwhite-dim uppercase tracking-wider">About Section</span>
            <CopyButton text={data.aboutSection} />
          </div>
          <p className="text-warmwhite-muted">{data.aboutSection}</p>
        </div>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-warmwhite mb-3">FAQ</h3>
          <div className="space-y-3">
            {faq.map((faqItem, i) => (
              <div key={i} className="bg-charcoal-dark rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-warmwhite text-sm">{faqItem?.question ?? ""}</span>
                  <CopyButton text={`Q: ${faqItem?.question ?? ""}\nA: ${faqItem?.answer ?? ""}`} />
                </div>
                <p className="text-warmwhite-muted text-sm">{faqItem?.answer ?? ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Setup Guide */}
      {data.setupGuide && (
        <div className="bg-spark/10 border border-spark/20 rounded-xl p-4">
          <h3 className="text-sm font-medium text-spark mb-2">How to Use This</h3>
          <p className="text-warmwhite-muted text-sm">{data.setupGuide}</p>
        </div>
      )}
    </div>
  );
}

// Social Media Posts Section
function SocialMediaSection({ posts }: { posts: SocialMediaPost[] }) {
  return (
    <div className="bg-charcoal-light rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-spark/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold text-warmwhite">Social Media Posts</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <div key={i} className="bg-charcoal-dark rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlatformIcon platform={post.platform} />
                <span className="text-warmwhite font-medium capitalize">{post.platform}</span>
              </div>
              <CopyButton text={`${post.caption}\n\n${post.hashtags.join(' ')}`} />
            </div>

            <p className="text-warmwhite-muted text-sm whitespace-pre-wrap">{post.caption}</p>

            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.hashtags.map((tag, j) => (
                  <span key={j} className="text-spark text-xs">
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-warmwhite/10 space-y-2">
              <div>
                <span className="text-xs text-warmwhite-dim">Visual suggestion:</span>
                <p className="text-xs text-warmwhite-muted">{post.visualSuggestion}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-warmwhite-dim">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Best time: {post.bestTimeToPost}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Email Templates Section
function EmailTemplatesSection({ emails }: { emails: GrowthEmailTemplate[] }) {
  const typeLabels = {
    launch_announcement: "Launch Announcement",
    cold_outreach: "Cold Outreach",
    follow_up: "Follow-Up / Referral Ask",
  };

  const typeDescriptions = {
    launch_announcement: "Send to friends, family, and your network",
    cold_outreach: "Send to potential first customers",
    follow_up: "Follow up and ask for referrals",
  };

  return (
    <div className="bg-charcoal-light rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-spark/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold text-warmwhite">Email Templates</h2>
      </div>

      <div className="space-y-4">
        {emails.map((email, i) => (
          <div key={i} className="bg-charcoal-dark rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-warmwhite font-medium">{typeLabels[email.type]}</span>
                <p className="text-warmwhite-dim text-xs">{typeDescriptions[email.type]}</p>
              </div>
              <CopyButton text={`Subject: ${email.subject}\n\n${email.body}`} />
            </div>

            <div className="bg-charcoal-light rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-warmwhite/10">
                <span className="text-xs text-warmwhite-dim">Subject:</span>
                <span className="text-sm text-warmwhite font-medium">{email.subject}</span>
              </div>
              <p className="text-warmwhite-muted text-sm whitespace-pre-wrap">{email.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Local Marketing Section
function LocalMarketingSection({ tactics }: { tactics: LocalMarketingTactic[] }) {
  return (
    <div className="bg-charcoal-light rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-spark/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold text-warmwhite">Local Marketing Tactics</h2>
      </div>

      <div className="space-y-3">
        {tactics.map((tactic, i) => (
          <div key={i} className="bg-charcoal-dark rounded-xl p-4 space-y-2">
            <h3 className="font-medium text-warmwhite">{tactic.tactic}</h3>
            <p className="text-warmwhite-muted text-sm">{tactic.details}</p>
            {tactic.pitchTemplate && (
              <div className="bg-charcoal-light rounded-lg p-3 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-warmwhite-dim">Pitch Template</span>
                  <CopyButton text={tactic.pitchTemplate} />
                </div>
                <p className="text-warmwhite-muted text-sm italic">&ldquo;{tactic.pitchTemplate}&rdquo;</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-charcoal-light rounded-2xl p-6">
        <div className="h-6 bg-charcoal-dark rounded w-40 mb-4" />
        <div className="h-20 bg-charcoal-dark rounded" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-charcoal-light rounded-2xl p-6">
          <div className="h-6 bg-charcoal-dark rounded w-48 mb-4" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="bg-charcoal-dark rounded-xl p-4">
                <div className="h-4 bg-charcoal-light rounded w-24 mb-2" />
                <div className="h-16 bg-charcoal-light rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GrowthPlan({ data, isLoading }: GrowthPlanProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Defensive: if data is completely null/undefined, show nothing
  if (!data) {
    return (
      <div className="bg-charcoal-light rounded-2xl p-8 text-center">
        <p className="text-warmwhite-muted">No growth plan data available.</p>
      </div>
    );
  }

  // Safe access to arrays
  const socialMediaPosts = data.socialMediaPosts ?? [];
  const emailTemplates = data.emailTemplates ?? [];
  const localMarketing = data.localMarketing ?? [];

  return (
    <div className="space-y-8">
      {/* Elevator Pitch */}
      {data.elevatorPitch && <ElevatorPitchSection pitch={data.elevatorPitch} />}

      {/* Landing Page Copy */}
      {data.landingPageCopy && <LandingPageSection data={data.landingPageCopy} />}

      {/* Social Media Posts */}
      {socialMediaPosts.length > 0 && (
        <SocialMediaSection posts={socialMediaPosts} />
      )}

      {/* Email Templates */}
      {emailTemplates.length > 0 && (
        <EmailTemplatesSection emails={emailTemplates} />
      )}

      {/* Local Marketing */}
      {localMarketing.length > 0 && (
        <LocalMarketingSection tactics={localMarketing} />
      )}
    </div>
  );
}
