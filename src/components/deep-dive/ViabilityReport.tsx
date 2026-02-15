"use client";

import type { ViabilityReport as ViabilityReportType } from "@/types";

interface ViabilityReportProps {
  report: ViabilityReportType;
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
