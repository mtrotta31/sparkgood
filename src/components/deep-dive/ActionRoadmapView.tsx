"use client";

import { useState } from "react";
import type { ActionRoadmap } from "@/types";

interface ActionRoadmapViewProps {
  roadmap: ActionRoadmap;
}

export default function ActionRoadmapView({ roadmap }: ActionRoadmapViewProps) {
  const [expandedPhase, setExpandedPhase] = useState<number>(0);

  const getCostBadge = (cost: string) => {
    switch (cost) {
      case "free":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Free</span>;
      case "low":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-spark/20 text-spark">$</span>;
      case "medium":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-spark/20 text-spark">$$</span>;
      case "high":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">$$$</span>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">Critical</span>;
      case "high":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-spark/20 text-spark font-medium">High</span>;
      case "medium":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-warmwhite/10 text-warmwhite-dim font-medium">Medium</span>;
      case "low":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-warmwhite/5 text-warmwhite-dim font-medium">Low</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Quick Wins */}
      <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-warmwhite">Quick Wins</h2>
            <p className="text-warmwhite-dim text-sm">Do these this week to build momentum</p>
          </div>
        </div>

        <div className="space-y-3">
          {roadmap.quickWins.map((win, i) => (
            <div key={i} className="flex items-start gap-4 bg-charcoal-dark/50 rounded-xl p-4">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 font-bold text-sm">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-warmwhite text-sm leading-relaxed">{win.task}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-warmwhite-dim">{win.timeframe}</span>
                  {getCostBadge(win.cost)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-warmwhite flex items-center gap-2">
          <svg className="w-6 h-6 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
          Launch Phases
        </h2>

        {roadmap.phases.map((phase, phaseIndex) => (
          <div key={phaseIndex} className="bg-charcoal-light rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpandedPhase(expandedPhase === phaseIndex ? -1 : phaseIndex)}
              className="w-full flex items-center justify-between p-6 hover:bg-charcoal-dark/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold
                  ${phaseIndex === 0 ? "bg-spark/20 text-spark" : ""}
                  ${phaseIndex === 1 ? "bg-accent/20 text-accent" : ""}
                  ${phaseIndex === 2 ? "bg-purple-500/20 text-purple-400" : ""}
                `}>
                  {phaseIndex + 1}
                </div>
                <div className="text-left">
                  <h3 className="font-display text-lg font-bold text-warmwhite">{phase.name}</h3>
                  <p className="text-warmwhite-dim text-sm">{phase.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-warmwhite-dim">{phase.tasks.length} tasks</span>
                <svg
                  className={`w-5 h-5 text-warmwhite-dim transition-transform ${expandedPhase === phaseIndex ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {expandedPhase === phaseIndex && (
              <div className="border-t border-warmwhite/10 p-6 pt-4">
                <div className="space-y-3">
                  {phase.tasks.map((task, taskIndex) => (
                    <div key={taskIndex} className="bg-charcoal-dark rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full border-2 border-warmwhite/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-warmwhite-dim">{taskIndex + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-warmwhite text-sm leading-relaxed">{task.task}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {getPriorityBadge(task.priority)}
                            {getCostBadge(task.cost)}
                            {task.dependencies.length > 0 && (
                              <span className="text-xs text-warmwhite-dim">
                                Depends on: {task.dependencies.join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Skip List */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-warmwhite">What NOT To Do Yet</h2>
            <p className="text-warmwhite-dim text-sm">Avoid these common mistakes</p>
          </div>
        </div>

        <ul className="space-y-3">
          {roadmap.skipList.map((skip, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-warmwhite-muted">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {skip}
            </li>
          ))}
        </ul>
      </div>

      {/* Progress Tracking Tip */}
      <div className="bg-spark/10 border border-spark/20 rounded-2xl p-6">
        <h3 className="font-display text-lg font-bold text-spark mb-3">Daily Check-In</h3>
        <p className="text-warmwhite-muted text-sm mb-4">End each day by answering these questions:</p>
        <ol className="space-y-2 text-sm text-warmwhite-muted">
          <li className="flex items-start gap-2">
            <span className="text-spark font-bold">1.</span>
            What worked today?
          </li>
          <li className="flex items-start gap-2">
            <span className="text-spark font-bold">2.</span>
            What didn&apos;t work?
          </li>
          <li className="flex items-start gap-2">
            <span className="text-spark font-bold">3.</span>
            Who do I need to follow up with?
          </li>
          <li className="flex items-start gap-2">
            <span className="text-spark font-bold">4.</span>
            What&apos;s the ONE most important thing tomorrow?
          </li>
        </ol>
      </div>
    </div>
  );
}
