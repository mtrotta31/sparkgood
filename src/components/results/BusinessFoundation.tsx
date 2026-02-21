"use client";

import type {
  BusinessFoundationData,
  ViabilityScoreItem,
  CompetitorAnalysisItem,
  StartupCostItem,
} from "@/types";

interface BusinessFoundationProps {
  data: BusinessFoundationData;
  isLoading?: boolean;
}

// Score color based on value
function getScoreColor(score: number): string {
  if (score >= 70) return "text-green-400";
  if (score >= 50) return "text-yellow-400";
  return "text-red-400";
}

function getScoreBg(score: number): string {
  if (score >= 70) return "bg-green-500/10 border-green-500/30";
  if (score >= 50) return "bg-yellow-500/10 border-yellow-500/30";
  return "bg-red-500/10 border-red-500/30";
}

// Viability Score Card
function ViabilityScoreCard({ score }: { score: number }) {
  const safeScore = score ?? 0;
  const label = safeScore >= 70 ? "Strong Opportunity" : safeScore >= 50 ? "Moderate Potential" : "Needs Work";

  return (
    <div className={`${getScoreBg(safeScore)} border rounded-2xl p-6 md:p-8`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-5xl md:text-6xl font-bold ${getScoreColor(safeScore)}`}>
              {safeScore}
            </span>
            <span className="text-warmwhite-dim text-xl">/100</span>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getScoreBg(safeScore)} border`}>
            <span className={`font-bold ${getScoreColor(safeScore)}`}>{label}</span>
          </div>
        </div>
        <div className="flex-1 max-w-md">
          <p className="text-warmwhite-muted">
            {safeScore >= 70
              ? "This business idea shows strong market potential. Proceed with confidence."
              : safeScore >= 50
              ? "This idea has potential but needs refinement in some areas before launching."
              : "Consider addressing the weak areas before investing significant resources."}
          </p>
        </div>
      </div>
    </div>
  );
}

// Score Breakdown Table
function ScoreBreakdownTable({ items }: { items?: ViabilityScoreItem[] }) {
  const safeItems = items ?? [];

  if (safeItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-charcoal-light rounded-2xl p-6 overflow-x-auto">
      <h3 className="font-display text-lg font-bold text-warmwhite mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Score Breakdown
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-warmwhite/10">
            <th className="text-left py-3 text-warmwhite-dim font-medium">Factor</th>
            <th className="text-center py-3 text-warmwhite-dim font-medium w-20">Score</th>
            <th className="text-left py-3 text-warmwhite-dim font-medium">Assessment</th>
          </tr>
        </thead>
        <tbody>
          {safeItems.map((item, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-charcoal-dark/30" : ""}>
              <td className="py-3 px-2 text-warmwhite font-medium">{item?.factor ?? "Unknown"}</td>
              <td className="py-3 px-2 text-center">
                <span className={`font-bold ${getScoreColor(item?.score ?? 0)}`}>{item?.score ?? 0}</span>
              </td>
              <td className="py-3 px-2 text-warmwhite-muted">{item?.assessment ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Market Research Section
function MarketResearchSection({ data }: { data?: BusinessFoundationData["marketViability"]["marketResearch"] }) {
  if (!data) {
    return null;
  }

  const trends = data.trends ?? [];
  const demandSignals = data.demandSignals ?? [];
  const risks = data.risks ?? [];
  const sources = data.sources ?? [];

  return (
    <div className="bg-charcoal-light rounded-2xl p-6 space-y-6">
      <h3 className="font-display text-lg font-bold text-warmwhite flex items-center gap-2">
        <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Market Research Findings
      </h3>

      {/* TAM/SAM/SOM */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-charcoal-dark rounded-xl p-4">
          <div className="text-xs text-warmwhite-dim uppercase tracking-wider mb-1">TAM</div>
          <div className="text-lg font-bold text-warmwhite">{data.tam ?? "N/A"}</div>
          <div className="text-xs text-warmwhite-dim">Total Addressable Market</div>
        </div>
        <div className="bg-charcoal-dark rounded-xl p-4">
          <div className="text-xs text-warmwhite-dim uppercase tracking-wider mb-1">SAM</div>
          <div className="text-lg font-bold text-warmwhite">{data.sam ?? "N/A"}</div>
          <div className="text-xs text-warmwhite-dim">Serviceable Available Market</div>
        </div>
        <div className="bg-charcoal-dark rounded-xl p-4">
          <div className="text-xs text-warmwhite-dim uppercase tracking-wider mb-1">SOM</div>
          <div className="text-lg font-bold text-warmwhite">{data.som ?? "N/A"}</div>
          <div className="text-xs text-warmwhite-dim">Serviceable Obtainable Market</div>
        </div>
      </div>

      {/* Growth Rate */}
      {data.growthRate && (
        <div className="bg-charcoal-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-sm font-medium text-warmwhite">Industry Growth Rate</span>
          </div>
          <p className="text-warmwhite-muted text-sm">{data.growthRate}</p>
        </div>
      )}

      {/* Trends and Demand Signals */}
      {(trends.length > 0 || demandSignals.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {trends.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-warmwhite mb-3">Market Trends</h4>
              <ul className="space-y-2">
                {trends.map((trend, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-warmwhite-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-spark mt-2 flex-shrink-0" />
                    {trend}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {demandSignals.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-warmwhite mb-3">Demand Signals</h4>
              <ul className="space-y-2">
                {demandSignals.map((signal, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-warmwhite-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                    {signal}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Risks */}
      {risks.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Market Risks
          </h4>
          <ul className="space-y-2">
            {risks.map((risk, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-warmwhite-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <div className="pt-4 border-t border-warmwhite/10">
          <h4 className="text-xs font-medium text-warmwhite-dim uppercase tracking-wider mb-2">Sources</h4>
          <ul className="flex flex-wrap gap-2">
            {sources.map((source, i) => (
              <li key={i} className="text-xs text-spark bg-spark/10 px-2 py-1 rounded">
                {source}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Competitor Table
function CompetitorTable({ competitors }: { competitors?: CompetitorAnalysisItem[] }) {
  const safeCompetitors = competitors ?? [];

  if (safeCompetitors.length === 0) {
    return null;
  }

  return (
    <div className="bg-charcoal-light rounded-2xl p-6 overflow-x-auto">
      <h3 className="font-display text-lg font-bold text-warmwhite mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Competitor Analysis
      </h3>
      <table className="w-full text-sm min-w-[600px]">
        <thead>
          <tr className="border-b border-warmwhite/10">
            <th className="text-left py-3 text-warmwhite-dim font-medium">Competitor</th>
            <th className="text-left py-3 text-warmwhite-dim font-medium">Pricing</th>
            <th className="text-left py-3 text-warmwhite-dim font-medium">Positioning</th>
            <th className="text-left py-3 text-warmwhite-dim font-medium">Weakness to Exploit</th>
          </tr>
        </thead>
        <tbody>
          {safeCompetitors.map((competitor, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-charcoal-dark/30" : ""}>
              <td className="py-3 px-2">
                <div className="font-medium text-warmwhite">{competitor?.name ?? "Unknown"}</div>
                {competitor?.url && (
                  <a
                    href={competitor.url.startsWith("http") ? competitor.url : `https://${competitor.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-spark text-xs hover:underline"
                  >
                    {competitor.url}
                  </a>
                )}
              </td>
              <td className="py-3 px-2 text-warmwhite-muted">{competitor?.pricing ?? "N/A"}</td>
              <td className="py-3 px-2 text-warmwhite-muted">{competitor?.positioning ?? "N/A"}</td>
              <td className="py-3 px-2 text-green-400">{competitor?.weakness ?? "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Legal Structure Section
function LegalStructureSection({ data }: { data?: BusinessFoundationData["legalStructure"] }) {
  if (!data) {
    return null;
  }

  const registrationSteps = data.registrationSteps ?? [];
  const licensesRequired = data.licensesRequired ?? [];

  return (
    <div className="bg-charcoal-light rounded-2xl p-6 space-y-4">
      <h3 className="font-display text-lg font-bold text-warmwhite flex items-center gap-2">
        <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Legal & Structure
      </h3>

      <div className="bg-charcoal-dark rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-spark font-bold text-lg">{data.recommendedStructure ?? "LLC"}</span>
          <span className="text-warmwhite-dim text-sm">Est. Cost: {data.estimatedCost ?? "Varies"}</span>
        </div>
        {data.reasoning && <p className="text-warmwhite-muted text-sm">{data.reasoning}</p>}
      </div>

      {registrationSteps.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-warmwhite mb-2">Registration Steps</h4>
          <ol className="space-y-2">
            {registrationSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-warmwhite-muted">
                <span className="w-6 h-6 rounded-full bg-spark/20 text-spark flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {licensesRequired.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-warmwhite mb-2">Licenses Required</h4>
          <ul className="flex flex-wrap gap-2">
            {licensesRequired.map((license, i) => (
              <li key={i} className="text-xs bg-warmwhite/10 text-warmwhite-muted px-2 py-1 rounded">
                {license}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.whenToGetLawyer && (
        <div className="bg-spark/10 border border-spark/20 rounded-xl p-4">
          <h4 className="text-sm font-medium text-spark mb-1">When to Get a Lawyer</h4>
          <p className="text-warmwhite-muted text-sm">{data.whenToGetLawyer}</p>
        </div>
      )}
    </div>
  );
}

// Startup Costs Table
function StartupCostsTable({ items }: { items?: StartupCostItem[] }) {
  const safeItems = items ?? [];

  if (safeItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-charcoal-light rounded-2xl p-6 overflow-x-auto">
      <h3 className="font-display text-lg font-bold text-warmwhite mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Startup Costs Breakdown
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-warmwhite/10">
            <th className="text-left py-3 text-warmwhite-dim font-medium">Item</th>
            <th className="text-right py-3 text-warmwhite-dim font-medium">Cost</th>
            <th className="text-center py-3 text-warmwhite-dim font-medium">Priority</th>
            <th className="text-left py-3 text-warmwhite-dim font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {safeItems.map((item, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-charcoal-dark/30" : ""}>
              <td className="py-3 px-2 text-warmwhite font-medium">{item?.item ?? "Unknown"}</td>
              <td className="py-3 px-2 text-right text-spark font-medium">{item?.cost ?? "N/A"}</td>
              <td className="py-3 px-2 text-center">
                <span className="text-xs px-2 py-0.5 rounded-full bg-warmwhite/10 text-warmwhite-dim">
                  {item?.priority ?? "N/A"}
                </span>
              </td>
              <td className="py-3 px-2 text-warmwhite-muted text-xs">{item?.notes ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Suppliers Section
function SuppliersSection({ data }: { data?: BusinessFoundationData["suppliers"] }) {
  if (!data) {
    return null;
  }

  const platforms = data.platforms ?? [];
  const evaluationChecklist = data.evaluationChecklist ?? [];

  if (platforms.length === 0) {
    return null;
  }

  return (
    <div className="bg-charcoal-light rounded-2xl p-6 space-y-4">
      <h3 className="font-display text-lg font-bold text-warmwhite flex items-center gap-2">
        <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        Suppliers & Vendors
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        {platforms.map((platform, i) => (
          <a
            key={i}
            href={platform?.url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-charcoal-dark rounded-xl p-4 hover:bg-charcoal-dark/70 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-warmwhite group-hover:text-spark transition-colors">
                {platform?.name ?? "Unknown"}
              </span>
              <svg className="w-4 h-4 text-warmwhite-dim group-hover:text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            {platform?.description && <p className="text-warmwhite-muted text-sm mb-2">{platform.description}</p>}
            {platform?.bestFor && <span className="text-xs text-spark">Best for: {platform.bestFor}</span>}
          </a>
        ))}
      </div>

      {evaluationChecklist.length > 0 && (
        <div className="bg-charcoal-dark rounded-xl p-4">
          <h4 className="text-sm font-medium text-warmwhite mb-2">Supplier Evaluation Checklist</h4>
          <ul className="space-y-1">
            {evaluationChecklist.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-warmwhite-muted">
                <svg className="w-4 h-4 text-spark flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(data.minimumOrderExpectations || data.paymentTermsInfo) && (
        <div className="grid md:grid-cols-2 gap-4">
          {data.minimumOrderExpectations && (
            <div className="bg-charcoal-dark rounded-xl p-4">
              <h4 className="text-xs font-medium text-warmwhite-dim uppercase tracking-wider mb-2">Minimum Orders</h4>
              <p className="text-warmwhite-muted text-sm">{data.minimumOrderExpectations}</p>
            </div>
          )}
          {data.paymentTermsInfo && (
            <div className="bg-charcoal-dark rounded-xl p-4">
              <h4 className="text-xs font-medium text-warmwhite-dim uppercase tracking-wider mb-2">Payment Terms</h4>
              <p className="text-warmwhite-muted text-sm">{data.paymentTermsInfo}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Tech Stack Section
function TechStackSection({ data }: { data?: BusinessFoundationData["techStack"] }) {
  if (!data) {
    return null;
  }

  const tools = data.tools ?? [];

  return (
    <div className="bg-charcoal-light rounded-2xl p-6 space-y-4">
      <h3 className="font-display text-lg font-bold text-warmwhite flex items-center gap-2">
        <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Technology & Tools
      </h3>

      {(data.recommendation || data.reasoning) && (
        <div className="bg-spark/10 border border-spark/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            {data.recommendation && <span className="font-medium text-spark">{data.recommendation}</span>}
            {data.setupTime && <span className="text-xs text-warmwhite-dim">Setup: {data.setupTime}</span>}
          </div>
          {data.reasoning && <p className="text-warmwhite-muted text-sm">{data.reasoning}</p>}
        </div>
      )}

      {tools.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {tools.map((tool, i) => (
            <a
              key={i}
              href={tool?.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-charcoal-dark rounded-xl p-4 hover:bg-charcoal-dark/70 transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-warmwhite group-hover:text-spark transition-colors">
                  {tool?.name ?? "Unknown"}
                </span>
                {tool?.cost && <span className="text-xs text-spark font-medium">{tool.cost}</span>}
              </div>
              {tool?.purpose && <p className="text-warmwhite-muted text-sm">{tool.purpose}</p>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// Insurance Section
function InsuranceSection({ data }: { data?: BusinessFoundationData["insurance"] }) {
  if (!data) {
    return null;
  }

  const required = data.required ?? [];
  const complianceNotes = data.complianceNotes ?? [];

  return (
    <div className="bg-charcoal-light rounded-2xl p-6 space-y-4">
      <h3 className="font-display text-lg font-bold text-warmwhite flex items-center gap-2">
        <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Insurance & Compliance
      </h3>

      {required.length > 0 && (
        <div className="grid gap-3">
          {required.map((insurance, i) => (
            <a
              key={i}
              href={insurance?.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-charcoal-dark rounded-xl p-4 flex items-center justify-between hover:bg-charcoal-dark/70 transition-colors group"
            >
              <div>
                <span className="font-medium text-warmwhite group-hover:text-spark transition-colors">
                  {insurance?.type ?? "Insurance"}
                </span>
                {insurance?.provider && <p className="text-warmwhite-muted text-sm">via {insurance.provider}</p>}
              </div>
              <div className="text-right">
                {insurance?.estimatedCost && <span className="text-spark font-medium">{insurance.estimatedCost}</span>}
                <p className="text-warmwhite-dim text-xs">per month</p>
              </div>
            </a>
          ))}
        </div>
      )}

      {data.totalEstimatedCost && (
        <div className="bg-charcoal-dark rounded-xl p-4 flex items-center justify-between">
          <span className="font-medium text-warmwhite">Total Estimated Insurance</span>
          <span className="text-lg font-bold text-spark">{data.totalEstimatedCost}/mo</span>
        </div>
      )}

      {complianceNotes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-warmwhite mb-2">Compliance Notes</h4>
          <ul className="space-y-1">
            {complianceNotes.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-warmwhite-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.taxObligations && (
        <div className="bg-spark/10 border border-spark/20 rounded-xl p-4">
          <h4 className="text-sm font-medium text-spark mb-1">Tax Obligations</h4>
          <p className="text-warmwhite-muted text-sm">{data.taxObligations}</p>
        </div>
      )}
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-charcoal-light rounded-2xl p-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-24 bg-charcoal-dark rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-charcoal-dark rounded w-48" />
            <div className="h-3 bg-charcoal-dark rounded w-64" />
          </div>
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-charcoal-light rounded-2xl p-6">
          <div className="h-6 bg-charcoal-dark rounded w-40 mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-charcoal-dark rounded w-full" />
            <div className="h-4 bg-charcoal-dark rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BusinessFoundation({ data, isLoading }: BusinessFoundationProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Defensive: if data is completely null/undefined, show nothing
  if (!data) {
    return (
      <div className="bg-charcoal-light rounded-2xl p-8 text-center">
        <p className="text-warmwhite-muted">No business foundation data available.</p>
      </div>
    );
  }

  // Safe access to nested properties
  const marketViability = data.marketViability;
  const overallScore = marketViability?.overallScore ?? 0;
  const scoreBreakdown = marketViability?.scoreBreakdown;
  const marketResearch = marketViability?.marketResearch;
  const competitorAnalysis = marketViability?.competitorAnalysis;
  const localMarketSize = marketViability?.localMarketSize;

  return (
    <div className="space-y-8">
      {/* Market Viability Score */}
      <ViabilityScoreCard score={overallScore} />

      {/* Score Breakdown */}
      <ScoreBreakdownTable items={scoreBreakdown} />

      {/* Market Research */}
      <MarketResearchSection data={marketResearch} />

      {/* Competitor Analysis */}
      <CompetitorTable competitors={competitorAnalysis} />

      {/* Local Market Size */}
      {localMarketSize && (
        <div className="bg-charcoal-light rounded-2xl p-6">
          <h3 className="font-display text-lg font-bold text-warmwhite mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Local Market Size
          </h3>
          <p className="text-warmwhite-muted">{localMarketSize}</p>
        </div>
      )}

      {/* Legal & Structure */}
      <LegalStructureSection data={data.legalStructure} />

      {/* Startup Costs */}
      <StartupCostsTable items={data.startupCosts} />

      {/* Suppliers */}
      <SuppliersSection data={data.suppliers} />

      {/* Tech Stack */}
      <TechStackSection data={data.techStack} />

      {/* Insurance */}
      <InsuranceSection data={data.insurance} />
    </div>
  );
}
