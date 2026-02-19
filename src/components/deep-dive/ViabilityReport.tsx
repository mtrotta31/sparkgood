"use client";

import type { ViabilityReport as ViabilityReportType, DimensionScore } from "@/types";

interface ViabilityReportProps {
  report: ViabilityReportType;
}

// Score bar component for individual dimensions
function ScoreBar({ label, score, icon }: { label: string; score: DimensionScore; icon: React.ReactNode }) {
  const percentage = (score.score / 10) * 100;

  // Color based on score
  const getBarColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-spark";
    if (score >= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTextColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-spark";
    if (score >= 4) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-warmwhite-dim">{icon}</span>
          <span className="text-sm font-medium text-warmwhite">{label}</span>
        </div>
        <span className={`text-sm font-bold ${getTextColor(score.score)}`}>
          {score.score.toFixed(1)}
        </span>
      </div>
      <div className="h-2 bg-charcoal-dark rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor(score.score)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-warmwhite-dim">{score.explanation}</p>
    </div>
  );
}

export default function ViabilityReport({ report }: ViabilityReportProps) {
  const getVerdictStyles = () => {
    switch (report.verdict) {
      case "go":
        return {
          bg: "bg-green-500/10",
          border: "border-green-500/30",
          text: "text-green-400",
          label: "GO",
          description: "Strong foundation. Proceed with confidence.",
        };
      case "refine":
        return {
          bg: "bg-spark/10",
          border: "border-spark/30",
          text: "text-spark",
          label: "REFINE",
          description: "Promising but needs work. Address weak areas before proceeding.",
        };
      case "pivot":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          text: "text-red-400",
          label: "PIVOT",
          description: "Significant issues. Reconsider your approach.",
        };
    }
  };

  const verdict = getVerdictStyles();

  // Default scores if not provided (for backwards compatibility)
  const defaultScore: DimensionScore = { score: report.viabilityScore, explanation: "Score based on overall analysis" };
  const scoreBreakdown = report.scoreBreakdown || {
    marketOpportunity: defaultScore,
    competitionLevel: defaultScore,
    feasibility: defaultScore,
    revenuePotential: defaultScore,
    impactPotential: defaultScore,
  };

  return (
    <div className="space-y-8">
      {/* Viability Score Card */}
      <div className={`${verdict.bg} ${verdict.border} border rounded-2xl p-6 md:p-8`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-4xl md:text-5xl font-bold ${verdict.text}`}>
                {report.viabilityScore.toFixed(1)}
              </span>
              <span className="text-warmwhite-dim text-lg">/10</span>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${verdict.bg} ${verdict.border} border`}>
              <span className={`font-bold ${verdict.text}`}>{verdict.label}</span>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <p className="text-warmwhite-muted">{verdict.description}</p>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="bg-charcoal-light rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold text-warmwhite mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Score Breakdown
        </h2>
        <div className="space-y-5">
          <ScoreBar
            label="Market Opportunity"
            score={scoreBreakdown.marketOpportunity}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <ScoreBar
            label="Competition Level"
            score={scoreBreakdown.competitionLevel}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <ScoreBar
            label="Feasibility"
            score={scoreBreakdown.feasibility}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
          <ScoreBar
            label="Revenue Potential"
            score={scoreBreakdown.revenuePotential}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <ScoreBar
            label="Impact Potential"
            score={scoreBreakdown.impactPotential}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-charcoal-light rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold text-warmwhite mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Strategic Recommendation
        </h2>
        <p className="text-warmwhite-muted leading-relaxed">{report.recommendation}</p>
      </div>

      {/* Market & Demand */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-charcoal-light rounded-2xl p-6">
          <h3 className="font-display text-lg font-bold text-warmwhite mb-3">Market Size</h3>
          <p className="text-warmwhite-muted text-sm leading-relaxed">{report.marketSize}</p>
        </div>
        <div className="bg-charcoal-light rounded-2xl p-6">
          <h3 className="font-display text-lg font-bold text-warmwhite mb-3">Demand Analysis</h3>
          <p className="text-warmwhite-muted text-sm leading-relaxed">{report.demandAnalysis}</p>
        </div>
      </div>

      {/* Target Audience */}
      <div className="bg-charcoal-light rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold text-warmwhite mb-6">Target Audience</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-warmwhite-dim uppercase tracking-wider mb-2">Primary Persona</h4>
            <p className="text-warmwhite-muted text-sm leading-relaxed">{report.targetAudience.primaryPersona}</p>
            <h4 className="text-sm font-medium text-warmwhite-dim uppercase tracking-wider mt-4 mb-2">Demographics</h4>
            <p className="text-warmwhite-muted text-sm">{report.targetAudience.demographics}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-warmwhite-dim uppercase tracking-wider mb-2">Pain Points</h4>
            <ul className="space-y-2">
              {report.targetAudience.painPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-warmwhite-muted">
                  <span className="text-red-400 mt-0.5">-</span>
                  {point}
                </li>
              ))}
            </ul>
            <h4 className="text-sm font-medium text-warmwhite-dim uppercase tracking-wider mt-4 mb-2">Motivations</h4>
            <ul className="space-y-2">
              {report.targetAudience.motivations.map((motivation, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-warmwhite-muted">
                  <span className="text-green-400 mt-0.5">+</span>
                  {motivation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SWOT-style Analysis */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-charcoal-light rounded-2xl p-5 md:p-6">
          <h3 className="font-display text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Strengths
          </h3>
          <ul className="space-y-3">
            {report.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-warmwhite-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-charcoal-light rounded-2xl p-5 md:p-6">
          <h3 className="font-display text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Risks
          </h3>
          <ul className="space-y-3">
            {report.risks.map((risk, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-warmwhite-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-charcoal-light rounded-2xl p-5 md:p-6 sm:col-span-2 lg:col-span-1">
          <h3 className="font-display text-lg font-bold text-spark mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Opportunities
          </h3>
          <ul className="space-y-3">
            {report.opportunities.map((opportunity, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-warmwhite-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-spark mt-2 flex-shrink-0" />
                {opportunity}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Competitors */}
      <div className="bg-charcoal-light rounded-2xl p-5 md:p-6">
        <h2 className="font-display text-lg md:text-xl font-bold text-warmwhite mb-4 md:mb-6">Competitive Landscape</h2>
        <div className="grid gap-3 md:gap-4">
          {report.competitors.map((competitor, i) => (
            <div key={i} className="bg-charcoal-dark rounded-xl p-4 md:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
                <div>
                  <h4 className="font-medium text-warmwhite">{competitor.name}</h4>
                  <a
                    href={competitor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-spark text-sm hover:underline"
                  >
                    {competitor.url}
                  </a>
                </div>
              </div>
              <p className="text-warmwhite-muted text-sm mb-4">{competitor.description}</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-medium text-warmwhite-dim uppercase tracking-wider mb-2">Strengths</h5>
                  <ul className="space-y-1">
                    {competitor.strengths.map((s, j) => (
                      <li key={j} className="text-xs text-warmwhite-muted flex items-center gap-1">
                        <span className="text-green-400">+</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-warmwhite-dim uppercase tracking-wider mb-2">Weaknesses</h5>
                  <ul className="space-y-1">
                    {competitor.weaknesses.map((w, j) => (
                      <li key={j} className="text-xs text-warmwhite-muted flex items-center gap-1">
                        <span className="text-red-400">-</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
