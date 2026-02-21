"use client";

import type {
  FinancialModelData,
  FinancialTableRow,
  RevenueScenario,
} from "@/types";

interface FinancialModelProps {
  data: FinancialModelData;
  isLoading?: boolean;
}

// Format currency with color
function formatCurrency(amount: number, showSign = false): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  if (showSign && amount !== 0) {
    return amount > 0 ? `+${formatted}` : `-${formatted}`;
  }
  return amount < 0 ? `-${formatted}` : formatted;
}

// Profit/loss color
function getProfitColor(amount: number): string {
  if (amount > 0) return "text-green-400";
  if (amount < 0) return "text-red-400";
  return "text-warmwhite-muted";
}

// Startup Costs Table
function StartupCostsTable({ items }: { items?: FinancialTableRow[] }) {
  const safeItems = items ?? [];
  if (safeItems.length === 0) return null;

  const total = safeItems.reduce((sum, item) => {
    const cost = parseFloat((item?.cost || "0").replace(/[^0-9.-]/g, ""));
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  return (
    <div className="bg-charcoal-light rounded-2xl p-6 overflow-x-auto">
      <h3 className="font-display text-lg font-bold text-warmwhite mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
        </svg>
        Startup Costs
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-warmwhite/10">
            <th className="text-left py-3 text-warmwhite-dim font-medium">Item</th>
            <th className="text-right py-3 text-warmwhite-dim font-medium">Cost</th>
            <th className="text-left py-3 text-warmwhite-dim font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {safeItems.map((item, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-charcoal-dark/30" : ""}>
              <td className="py-3 px-2 text-warmwhite font-medium">{item?.item ?? "Unknown"}</td>
              <td className="py-3 px-2 text-right text-spark font-medium">{item?.cost ?? "N/A"}</td>
              <td className="py-3 px-2 text-warmwhite-muted text-xs">{item?.notes ?? ""}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-warmwhite/20">
            <td className="py-3 px-2 text-warmwhite font-bold">TOTAL</td>
            <td className="py-3 px-2 text-right text-spark font-bold text-lg">{formatCurrency(total)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// Monthly Operating Costs Table
function OperatingCostsTable({ items }: { items?: FinancialTableRow[] }) {
  const safeItems = items ?? [];
  if (safeItems.length === 0) return null;

  const monthlyTotal = safeItems.reduce((sum, item) => {
    const cost = parseFloat((item?.monthlyCost || "0").replace(/[^0-9.-]/g, ""));
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  const annualTotal = safeItems.reduce((sum, item) => {
    const cost = parseFloat((item?.annualCost || "0").replace(/[^0-9.-]/g, ""));
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  return (
    <div className="bg-charcoal-light rounded-2xl p-6 overflow-x-auto">
      <h3 className="font-display text-lg font-bold text-warmwhite mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Monthly Operating Costs
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-warmwhite/10">
            <th className="text-left py-3 text-warmwhite-dim font-medium">Expense</th>
            <th className="text-right py-3 text-warmwhite-dim font-medium">Monthly</th>
            <th className="text-right py-3 text-warmwhite-dim font-medium">Annual</th>
            <th className="text-left py-3 text-warmwhite-dim font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {safeItems.map((item, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-charcoal-dark/30" : ""}>
              <td className="py-3 px-2 text-warmwhite font-medium">{item?.item ?? "Unknown"}</td>
              <td className="py-3 px-2 text-right text-warmwhite">{item?.monthlyCost ?? "N/A"}</td>
              <td className="py-3 px-2 text-right text-warmwhite-muted">{item?.annualCost ?? "N/A"}</td>
              <td className="py-3 px-2 text-warmwhite-muted text-xs">{item?.notes ?? ""}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-warmwhite/20">
            <td className="py-3 px-2 text-warmwhite font-bold">TOTAL</td>
            <td className="py-3 px-2 text-right text-spark font-bold">{formatCurrency(monthlyTotal)}</td>
            <td className="py-3 px-2 text-right text-warmwhite-muted font-bold">{formatCurrency(annualTotal)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// Revenue Projections Table
function RevenueProjectionsTable({ projections }: { projections?: FinancialModelData["revenueProjections"] }) {
  if (!projections) return null;
  const scenarios: Array<{ key: keyof typeof projections; label: string }> = [
    { key: "conservative", label: "Conservative" },
    { key: "moderate", label: "Moderate" },
    { key: "aggressive", label: "Aggressive" },
  ];

  const rows: Array<{
    label: string;
    key: keyof RevenueScenario;
    format: (v: number | string) => string;
    highlight?: boolean;
  }> = [
    { label: "Monthly Customers", key: "monthlyCustomers", format: (v) => String(v) },
    { label: "Average Order", key: "averageOrder", format: (v) => formatCurrency(v as number) },
    { label: "Monthly Revenue", key: "monthlyRevenue", format: (v) => formatCurrency(v as number) },
    { label: "Monthly Costs", key: "monthlyCosts", format: (v) => formatCurrency(v as number) },
    { label: "Monthly Profit", key: "monthlyProfit", format: (v) => formatCurrency(v as number), highlight: true },
    { label: "Break-Even Month", key: "breakEvenMonth", format: (v) => String(v) },
  ];

  return (
    <div className="bg-charcoal-light rounded-2xl p-6 overflow-x-auto">
      <h3 className="font-display text-lg font-bold text-warmwhite mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Revenue Projections
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-warmwhite/10">
            <th className="text-left py-3 text-warmwhite-dim font-medium"></th>
            {scenarios.map(({ key, label }) => (
              <th key={key} className="text-center py-3 text-warmwhite-dim font-medium">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.key}
              className={`
                ${i % 2 === 0 ? "bg-charcoal-dark/30" : ""}
                ${row.highlight ? "bg-spark/10" : ""}
              `}
            >
              <td className={`py-3 px-2 font-medium ${row.highlight ? "text-spark" : "text-warmwhite"}`}>
                {row.label}
              </td>
              {scenarios.map(({ key }) => {
                const scenario = projections[key];
                const value = scenario[row.key as keyof RevenueScenario];
                const isProfit = row.key === "monthlyProfit";

                return (
                  <td
                    key={key}
                    className={`py-3 px-2 text-center font-medium ${
                      isProfit ? getProfitColor(value as number) : "text-warmwhite"
                    } ${row.highlight ? "text-lg" : ""}`}
                  >
                    {typeof value === "number" ? row.format(value) : value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Break-Even Analysis Card
function BreakEvenCard({ analysis }: { analysis?: FinancialModelData["breakEvenAnalysis"] }) {
  if (!analysis) return null;

  const unitsNeeded = analysis.unitsNeeded ?? 0;

  return (
    <div className="bg-gradient-to-br from-spark/10 to-accent/10 border border-spark/20 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-spark/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="font-display text-lg font-bold text-warmwhite">Break-Even Analysis</h3>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="bg-charcoal-dark rounded-xl p-4 flex-1">
          <div className="text-sm text-warmwhite-dim mb-1">Units/Customers Needed</div>
          <div className="text-3xl font-bold text-spark">{unitsNeeded}</div>
          <div className="text-xs text-warmwhite-dim">per month to break even</div>
        </div>

        {/* Visual indicator */}
        <div className="w-24 h-24 relative">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-charcoal-dark"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${Math.min(100, unitsNeeded) * 2.51} 251`}
              strokeLinecap="round"
              className="text-spark"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {analysis.description && <p className="text-warmwhite-muted">{analysis.description}</p>}
    </div>
  );
}

// Pricing Strategy Card
function PricingStrategyCard({ strategy }: { strategy?: FinancialModelData["pricingStrategy"] }) {
  if (!strategy) return null;

  const psychologyTips = strategy.psychologyTips ?? [];

  return (
    <div className="bg-charcoal-light rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-spark/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <h3 className="font-display text-lg font-bold text-warmwhite">Pricing Strategy</h3>
      </div>

      <div className="bg-charcoal-dark rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-warmwhite-dim text-sm">Recommended Price</span>
          <span className="text-2xl font-bold text-spark">{strategy.recommendedPrice ?? "TBD"}</span>
        </div>
        {strategy.reasoning && <p className="text-warmwhite-muted text-sm">{strategy.reasoning}</p>}
      </div>

      {psychologyTips.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-warmwhite mb-2">Pricing Psychology Tips</h4>
          <ul className="space-y-2">
            {psychologyTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-warmwhite-muted">
                <svg className="w-4 h-4 text-spark flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {strategy.testingApproach && (
        <div className="bg-spark/10 border border-spark/20 rounded-xl p-4">
          <h4 className="text-sm font-medium text-spark mb-1">How to Test Pricing</h4>
          <p className="text-warmwhite-muted text-sm">{strategy.testingApproach}</p>
        </div>
      )}
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-charcoal-light rounded-2xl p-6">
          <div className="h-6 bg-charcoal-dark rounded w-48 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-10 bg-charcoal-dark rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FinancialModel({ data, isLoading }: FinancialModelProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Defensive: if data is completely null/undefined, show nothing
  if (!data) {
    return (
      <div className="bg-charcoal-light rounded-2xl p-8 text-center">
        <p className="text-warmwhite-muted">No financial model data available.</p>
      </div>
    );
  }

  // Safe access to arrays
  const startupCostsSummary = data.startupCostsSummary ?? [];
  const monthlyOperatingCosts = data.monthlyOperatingCosts ?? [];

  return (
    <div className="space-y-8">
      {/* Startup Costs */}
      {startupCostsSummary.length > 0 && (
        <StartupCostsTable items={startupCostsSummary} />
      )}

      {/* Monthly Operating Costs */}
      {monthlyOperatingCosts.length > 0 && (
        <OperatingCostsTable items={monthlyOperatingCosts} />
      )}

      {/* Revenue Projections */}
      {data.revenueProjections && (
        <RevenueProjectionsTable projections={data.revenueProjections} />
      )}

      {/* Break-Even Analysis */}
      {data.breakEvenAnalysis && (
        <BreakEvenCard analysis={data.breakEvenAnalysis} />
      )}

      {/* Pricing Strategy */}
      {data.pricingStrategy && (
        <PricingStrategyCard strategy={data.pricingStrategy} />
      )}
    </div>
  );
}
