"use client";

interface ProgressBarProps {
  progress: number; // 0-100
  showLabel?: boolean;
}

export default function ProgressBar({
  progress,
  showLabel = false,
}: ProgressBarProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-warmwhite-muted">Progress</span>
          <span className="text-warmwhite font-medium">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
      <div className="w-full h-1.5 bg-charcoal-light rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-spark to-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
