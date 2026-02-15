"use client";

import type { BusinessPlan, UserProfile } from "@/types";

interface BusinessPlanViewProps {
  plan: BusinessPlan;
  profile: UserProfile;
}

export default function BusinessPlanView({ plan, profile }: BusinessPlanViewProps) {
  const isProject = profile.ventureType === "project";

  return (
    <div className="space-y-8">
      {/* Executive Summary */}
      <div className="bg-gradient-to-br from-spark/10 to-accent/5 border border-spark/20 rounded-2xl p-6 md:p-8">
        <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">Executive Summary</h2>
        <div className="prose prose-invert prose-sm max-w-none">
          {plan.executiveSummary.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-warmwhite-muted leading-relaxed">{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Mission & Impact */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-charcoal-light rounded-2xl p-6">
          <h3 className="font-display text-lg font-bold text-warmwhite mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
            Mission Statement
          </h3>
          <p className="text-warmwhite-muted leading-relaxed">{plan.missionStatement}</p>
        </div>
        <div className="bg-charcoal-light rounded-2xl p-6">
          <h3 className="font-display text-lg font-bold text-warmwhite mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Impact Thesis
          </h3>
          <p className="text-warmwhite-muted leading-relaxed">{plan.impactThesis}</p>
        </div>
      </div>

      {/* Revenue/Volunteer Plan */}
      {isProject && plan.volunteerPlan ? (
        <div className="bg-charcoal-light rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold text-warmwhite mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            Volunteer Plan
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-warmwhite-dim uppercase tracking-wider mb-3">Roles Needed</h4>
              <ul className="space-y-2">
                {plan.volunteerPlan.rolesNeeded.map((role, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-warmwhite-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-spark mt-2 flex-shrink-0" />
                    {role}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-warmwhite-dim uppercase tracking-wider mb-3">Recruitment</h4>
              <p className="text-sm text-warmwhite-muted">{plan.volunteerPlan.recruitmentStrategy}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-warmwhite-dim uppercase tracking-wider mb-3">Retention</h4>
              <p className="text-sm text-warmwhite-muted">{plan.volunteerPlan.retentionStrategy}</p>
            </div>
          </div>
        </div>
      ) : plan.revenueStreams ? (
        <div className="bg-charcoal-light rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold text-warmwhite mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            Revenue Streams
          </h2>
          <div className="grid gap-4">
            {plan.revenueStreams.map((stream, i) => (
              <div key={i} className="bg-charcoal-dark rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="font-medium text-warmwhite">{stream.name}</h4>
                  <span className="text-spark font-medium text-sm whitespace-nowrap">{stream.estimatedRevenue}</span>
                </div>
                <p className="text-warmwhite-muted text-sm mb-2">{stream.description}</p>
                <span className="text-xs text-warmwhite-dim">Timeline: {stream.timeline}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Budget Plan */}
      {plan.budgetPlan && plan.budgetPlan.length > 0 && (
        <div className="bg-charcoal-light rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold text-warmwhite mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Budget Plan
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-warmwhite/10">
                  <th className="text-left text-sm font-medium text-warmwhite-dim uppercase tracking-wider py-3">Category</th>
                  <th className="text-right text-sm font-medium text-warmwhite-dim uppercase tracking-wider py-3">Amount</th>
                  <th className="text-center text-sm font-medium text-warmwhite-dim uppercase tracking-wider py-3">Priority</th>
                  <th className="text-left text-sm font-medium text-warmwhite-dim uppercase tracking-wider py-3 hidden md:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmwhite/5">
                {plan.budgetPlan.map((item, i) => (
                  <tr key={i}>
                    <td className="py-4 text-sm text-warmwhite">{item.category}</td>
                    <td className="py-4 text-sm text-warmwhite text-right font-medium">
                      {item.amount === 0 ? "$0 (free)" : `$${item.amount}`}
                    </td>
                    <td className="py-4 text-center">
                      <span className={`
                        text-xs font-medium px-2 py-1 rounded-full
                        ${item.priority === "essential" ? "bg-red-500/20 text-red-400" : ""}
                        ${item.priority === "important" ? "bg-spark/20 text-spark" : ""}
                        ${item.priority === "nice_to_have" ? "bg-warmwhite/10 text-warmwhite-dim" : ""}
                      `}>
                        {item.priority.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-warmwhite-muted hidden md:table-cell">{item.notes}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-warmwhite/20">
                  <td className="py-4 text-sm font-bold text-warmwhite">Total</td>
                  <td className="py-4 text-sm font-bold text-spark text-right">
                    ${plan.budgetPlan.reduce((sum, item) => sum + item.amount, 0)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Partnerships */}
      <div className="bg-charcoal-light rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold text-warmwhite mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          Partnerships
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {plan.partnerships.map((partnership, i) => (
            <div key={i} className="bg-charcoal-dark rounded-xl p-5">
              <h4 className="font-medium text-spark mb-2">{partnership.type}</h4>
              <p className="text-warmwhite-muted text-sm mb-4">{partnership.description}</p>
              <h5 className="text-xs font-medium text-warmwhite-dim uppercase tracking-wider mb-2">Potential Partners</h5>
              <ul className="space-y-1">
                {partnership.potentialPartners.map((partner, j) => (
                  <li key={j} className="text-xs text-warmwhite-muted">• {partner}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Operations */}
      <div className="bg-charcoal-light rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold text-warmwhite mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Operations
        </h2>
        <div className="prose prose-invert prose-sm max-w-none">
          {plan.operations.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-warmwhite-muted leading-relaxed">{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Impact Measurement */}
      <div className="bg-charcoal-light rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold text-warmwhite mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          Impact Measurement
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {plan.impactMeasurement.map((metric, i) => (
            <div key={i} className="bg-charcoal-dark rounded-xl p-5">
              <h4 className="font-medium text-warmwhite mb-1">{metric.metric}</h4>
              <p className="text-spark text-sm font-medium mb-3">{metric.target}</p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-warmwhite-dim block mb-1">Method</span>
                  <span className="text-warmwhite-muted">{metric.measurementMethod}</span>
                </div>
                <div>
                  <span className="text-warmwhite-dim block mb-1">Frequency</span>
                  <span className="text-warmwhite-muted">{metric.frequency}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
