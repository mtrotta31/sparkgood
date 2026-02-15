"use client";

interface CauseTagProps {
  label: string;
  emoji?: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export default function CauseTag({
  label,
  emoji,
  selected = false,
  onClick,
  disabled = false,
}: CauseTagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
        transition-all duration-200 border-2
        ${
          selected
            ? "border-spark bg-spark/15 text-spark shadow-md shadow-spark/10"
            : "border-warmwhite/20 text-warmwhite-muted hover:border-warmwhite/40 hover:text-warmwhite hover:bg-charcoal-light"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-spark focus-visible:ring-offset-1 focus-visible:ring-offset-charcoal-dark
      `}
    >
      {emoji && <span className="text-base">{emoji}</span>}
      <span>{label}</span>
    </button>
  );
}
