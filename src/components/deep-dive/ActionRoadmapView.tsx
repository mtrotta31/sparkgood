"use client";

import { useState } from "react";
import type { ActionRoadmap, Idea, UserProfile } from "@/types";
import type { GeneratedAsset } from "@/types/assets";
import { isBuildableTask, detectAssetType } from "@/types/assets";
import BuildAssetModal from "./BuildAssetModal";

interface ActionRoadmapViewProps {
  roadmap: ActionRoadmap;
  idea?: Idea;
  profile?: UserProfile;
}

export default function ActionRoadmapView({ roadmap, idea, profile }: ActionRoadmapViewProps) {
  const [expandedPhase, setExpandedPhase] = useState<number>(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<string>("");
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [generatedAsset, setGeneratedAsset] = useState<GeneratedAsset | null>(null);

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

  // Handle "Build This For Me" click
  const handleBuildClick = async (taskDescription: string) => {
    if (!idea) {
      console.error("No idea provided for asset building");
      return;
    }

    const assetType = detectAssetType(taskDescription);
    if (!assetType) {
      console.error("Could not detect asset type");
      return;
    }

    // Open modal and start building
    setCurrentTask(taskDescription);
    setIsModalOpen(true);
    setIsBuilding(true);
    setBuildError(null);
    setGeneratedAsset(null);

    try {
      const response = await fetch("/api/build-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskDescription,
          assetType,
          idea: {
            name: idea.name,
            tagline: idea.tagline,
            problem: idea.problem,
            audience: idea.audience,
            impact: idea.impact,
            revenueModel: idea.revenueModel,
            causeAreas: idea.causeAreas,
          },
          profile: profile ? {
            ventureType: profile.ventureType,
            format: profile.format,
            experience: profile.experience,
            budget: profile.budget,
            commitment: profile.commitment,
          } : {},
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setGeneratedAsset(result.data);
      } else {
        setBuildError(result.error || "Failed to generate asset");
      }
    } catch (err) {
      console.error("Error building asset:", err);
      setBuildError("Something went wrong. Please try again.");
    } finally {
      setIsBuilding(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setGeneratedAsset(null);
    setBuildError(null);
    setCurrentTask("");
  };

  // Build button component
  const BuildButton = ({ taskDescription }: { taskDescription: string }) => {
    const assetType = detectAssetType(taskDescription);
    if (!assetType || !idea) return null;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleBuildClick(taskDescription);
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-spark/20 text-spark text-xs font-medium hover:bg-spark/30 transition-colors border border-spark/30"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
        Build This
      </button>
    );
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
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="text-xs text-warmwhite-dim">{win.timeframe}</span>
                  {getCostBadge(win.cost)}
                  {isBuildableTask(win.task) && <BuildButton taskDescription={win.task} />}
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
                            {isBuildableTask(task.task) && <BuildButton taskDescription={task.task} />}
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

      {/* Resources Section - Coming Soon */}
      <div className="bg-charcoal-light rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-warmwhite">Resources That Can Help</h2>
            <p className="text-warmwhite-dim text-sm">Support matched to your idea and location</p>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-accent text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Coming Soon
          </div>
          <p className="text-warmwhite-muted text-sm mt-1">
            We&apos;re building a directory of resources matched to your idea. Check back soon!
          </p>
        </div>

        {/* Resource Category Cards (Placeholder) */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Grants */}
          <div className="bg-charcoal-dark rounded-xl p-5 opacity-60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-warmwhite">Grants & Funding</h3>
                <p className="text-xs text-warmwhite-dim">Foundation and government grants</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-warmwhite-dim text-sm">
              <div className="w-2 h-2 rounded-full bg-warmwhite/20 animate-pulse" />
              Matching resources...
            </div>
          </div>

          {/* Accelerators */}
          <div className="bg-charcoal-dark rounded-xl p-5 opacity-60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-spark/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-warmwhite">Accelerators</h3>
                <p className="text-xs text-warmwhite-dim">Programs to help you grow faster</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-warmwhite-dim text-sm">
              <div className="w-2 h-2 rounded-full bg-warmwhite/20 animate-pulse" />
              Matching resources...
            </div>
          </div>

          {/* Coworking Spaces */}
          <div className="bg-charcoal-dark rounded-xl p-5 opacity-60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-warmwhite">Coworking Spaces</h3>
                <p className="text-xs text-warmwhite-dim">Work and meeting spaces near you</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-warmwhite-dim text-sm">
              <div className="w-2 h-2 rounded-full bg-warmwhite/20 animate-pulse" />
              Matching resources...
            </div>
          </div>

          {/* Mentorship */}
          <div className="bg-charcoal-dark rounded-xl p-5 opacity-60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-warmwhite">Mentorship Programs</h3>
                <p className="text-xs text-warmwhite-dim">Learn from experienced founders</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-warmwhite-dim text-sm">
              <div className="w-2 h-2 rounded-full bg-warmwhite/20 animate-pulse" />
              Matching resources...
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-warmwhite-dim text-xs mt-6">
          Resources will be personalized based on your cause area, location, and venture type
        </p>
      </div>

      {/* Build Asset Modal */}
      <BuildAssetModal
        isOpen={isModalOpen}
        onClose={closeModal}
        asset={generatedAsset}
        isLoading={isBuilding}
        error={buildError}
        taskDescription={currentTask}
      />
    </div>
  );
}
