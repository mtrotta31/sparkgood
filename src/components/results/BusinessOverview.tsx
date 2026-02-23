"use client";

import type { Idea } from "@/types";

interface BusinessOverviewProps {
  idea: Idea;
}

export default function BusinessOverview({ idea }: BusinessOverviewProps) {
  // Derive the "How It Works" description from mechanism or revenueModel
  const howItWorks = idea.mechanism || idea.revenueModel || null;

  // Derive the differentiation from competitiveAdvantage or valueProposition
  const differentiation = idea.competitiveAdvantage || idea.valueProposition || null;

  // Check if we have meaningful content to display
  // Beyond name/tagline, we need at least problem or audience
  const hasContent = idea.problem || idea.audience;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-charcoal-light to-charcoal rounded-2xl p-6 md:p-8 border border-warmwhite/10 mb-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-warmwhite mb-2">
          {idea.name}
        </h2>
        <p className="text-lg text-warmwhite-muted italic">
          {idea.tagline}
        </p>
      </div>

      {/* Overview Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* The Problem */}
        {idea.problem && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-medium text-warmwhite text-sm uppercase tracking-wider">
                The Problem
              </h3>
            </div>
            <p className="text-warmwhite-muted text-sm leading-relaxed pl-10">
              {idea.problem}
            </p>
          </div>
        )}

        {/* Who It Serves */}
        {idea.audience && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-warmwhite text-sm uppercase tracking-wider">
                Who It Serves
              </h3>
            </div>
            <p className="text-warmwhite-muted text-sm leading-relaxed pl-10">
              {idea.audience}
            </p>
          </div>
        )}

        {/* How It Works */}
        {howItWorks && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-spark/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-warmwhite text-sm uppercase tracking-wider">
                How It Works
              </h3>
            </div>
            <p className="text-warmwhite-muted text-sm leading-relaxed pl-10">
              {howItWorks}
            </p>
          </div>
        )}

        {/* What Makes It Different */}
        {differentiation && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-medium text-warmwhite text-sm uppercase tracking-wider">
                What Makes It Different
              </h3>
            </div>
            <p className="text-warmwhite-muted text-sm leading-relaxed pl-10">
              {differentiation}
            </p>
          </div>
        )}
      </div>

      {/* Social Enterprise Impact (if applicable) */}
      {idea.impact && (
        <div className="mt-6 pt-6 border-t border-warmwhite/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-medium text-warmwhite text-sm uppercase tracking-wider">
              Social Impact
            </h3>
          </div>
          <p className="text-warmwhite-muted text-sm leading-relaxed pl-10">
            {idea.impact}
          </p>
        </div>
      )}
    </div>
  );
}
