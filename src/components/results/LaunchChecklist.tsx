"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  LaunchChecklistData,
  ChecklistItem,
  ChecklistProgress,
  MatchedResourceRef,
} from "@/types";
import { sanitizeMarkdownHTML } from "@/lib/sanitize";

interface LaunchChecklistProps {
  data: LaunchChecklistData;
  progress: ChecklistProgress;
  onProgressChange: (itemId: string, checked: boolean) => void;
  isLoading?: boolean;
}

// Priority badge component
function PriorityBadge({ priority }: { priority: ChecklistItem["priority"] }) {
  const styles = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    important: "bg-spark/20 text-spark border-spark/30",
    optional: "bg-warmwhite/10 text-warmwhite-dim border-warmwhite/20",
  };

  const labels = {
    critical: "Critical",
    important: "Important",
    optional: "Optional",
  };

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${styles[priority]}`}
    >
      {labels[priority]}
    </span>
  );
}

// Resource card component
function ResourceCard({ resource }: { resource: MatchedResourceRef }) {
  const typeStyles = {
    grant: "bg-green-500/10 border-green-500/30 text-green-400",
    accelerator: "bg-orange-500/10 border-orange-500/30 text-orange-400",
    coworking: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    sba: "bg-red-500/10 border-red-500/30 text-red-400",
  };

  const typeLabels = {
    grant: "Grant",
    accelerator: "Accelerator",
    coworking: "Coworking",
    sba: "SBA Resource",
  };

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block p-3 rounded-lg border ${typeStyles[resource.type]} hover:bg-opacity-20 transition-colors`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-warmwhite text-sm">{resource.name}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-warmwhite/10">
          {typeLabels[resource.type]}
        </span>
      </div>
      {resource.description && (
        <p className="text-xs text-warmwhite-muted line-clamp-2">{resource.description}</p>
      )}
      <div className="flex items-center gap-1 mt-2 text-xs text-spark">
        <span>View Resource</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </a>
  );
}

// Checklist item component
function ChecklistItemRow({
  item,
  isChecked,
  onToggle,
}: {
  item: ChecklistItem;
  isChecked: boolean;
  onToggle: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-charcoal-dark rounded-xl overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-charcoal-light/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`
            w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
            ${isChecked
              ? "bg-green-500 border-green-500"
              : "border-warmwhite/30 hover:border-spark"
            }
          `}
        >
          {isChecked && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-medium text-sm ${isChecked ? "text-warmwhite-muted line-through" : "text-warmwhite"}`}>
              {item.title}
            </h4>
            <svg
              className={`w-5 h-5 text-warmwhite-dim transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <PriorityBadge priority={item.priority} />
            <span className="text-xs text-warmwhite-dim flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {item.estimatedTime}
            </span>
            <span className="text-xs text-warmwhite-dim flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {item.estimatedCost}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-warmwhite/10 p-4 pt-4 space-y-4">
          {/* Guide content (rendered as markdown-like, sanitized for XSS protection) */}
          <div className="prose prose-sm prose-invert max-w-none">
            <div
              className="text-sm text-warmwhite-muted leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: sanitizeMarkdownHTML(
                  item.guide
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-warmwhite">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`(.*?)`/g, '<code class="bg-charcoal-light px-1 rounded text-spark">$1</code>')
                    .replace(/\n/g, '<br/>')
                )
              }}
            />
          </div>

          {/* External links */}
          {item.links && item.links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-spark/10 text-spark text-xs font-medium hover:bg-spark/20 transition-colors"
                >
                  {link.label}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          )}

          {/* Matched resources */}
          {item.resources && item.resources.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-warmwhite-dim uppercase tracking-wider">
                Matched Resources
              </h5>
              <div className="grid gap-2 sm:grid-cols-2">
                {item.resources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 bg-charcoal-light rounded w-48" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-charcoal-light rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-md bg-charcoal-dark" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-charcoal-dark rounded w-3/4" />
                <div className="flex gap-2">
                  <div className="h-5 bg-charcoal-dark rounded w-16" />
                  <div className="h-5 bg-charcoal-dark rounded w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LaunchChecklist({
  data,
  progress,
  onProgressChange,
  isLoading,
}: LaunchChecklistProps) {
  // Defensive: ensure weeks array exists
  const weeks = data?.weeks ?? [];

  // Calculate progress stats
  const stats = useMemo(() => {
    const allItems = weeks.flatMap((week) => week?.items ?? []);
    const totalItems = allItems.length;
    const completedItems = allItems.filter((item) => item?.id && progress[item.id]).length;
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    return { total: totalItems, completed: completedItems, percentage };
  }, [weeks, progress]);

  const handleToggle = useCallback(
    (itemId: string) => {
      onProgressChange(itemId, !progress[itemId]);
    },
    [progress, onProgressChange]
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Defensive: if no data at all, show empty state
  if (!data || weeks.length === 0) {
    return (
      <div className="bg-charcoal-light rounded-2xl p-8 text-center">
        <p className="text-warmwhite-muted">No checklist data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="bg-charcoal-light rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-spark/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-warmwhite">Launch Progress</h2>
              <p className="text-warmwhite-dim text-sm">
                {stats.completed} of {stats.total} steps complete
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold text-spark">{stats.percentage}%</span>
        </div>

        {/* Progress bar visual */}
        <div className="h-3 bg-charcoal-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-spark to-accent rounded-full transition-all duration-500"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* Weeks */}
      {weeks.map((week) => {
        const weekNumber = week?.weekNumber ?? 0;
        const weekTitle = week?.title ?? "";
        const weekItems = week?.items ?? [];

        return (
          <div key={weekNumber} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold
                ${weekNumber === 1 ? "bg-spark/20 text-spark" : ""}
                ${weekNumber === 2 ? "bg-accent/20 text-accent" : ""}
                ${weekNumber === 3 ? "bg-purple-500/20 text-purple-400" : ""}
                ${weekNumber === 4 ? "bg-green-500/20 text-green-400" : ""}
                ${weekNumber > 4 ? "bg-blue-500/20 text-blue-400" : ""}
              `}>
                {weekNumber}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-warmwhite">
                  Week {weekNumber}: {weekTitle}
                </h3>
                <p className="text-warmwhite-dim text-sm">
                  {weekItems.filter((item) => item?.id && progress[item.id]).length} of {weekItems.length} complete
                </p>
              </div>
            </div>

            <div className="space-y-3 ml-5 pl-8 border-l-2 border-warmwhite/10">
              {weekItems.map((item) => item?.id && (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  isChecked={!!progress[item.id]}
                  onToggle={() => handleToggle(item.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
