"use client";

interface OptionCardProps {
  title: string;
  description: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export default function OptionCard({
  title,
  description,
  selected = false,
  onClick,
  disabled = false,
  icon,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-4 md:p-6 rounded-2xl text-left transition-all duration-200
        border-2 group
        ${
          selected
            ? "border-spark bg-spark/10 shadow-lg shadow-spark/10"
            : "border-warmwhite/10 hover:border-warmwhite/30 hover:bg-charcoal-light"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-spark focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-dark
      `}
    >
      <div className="flex items-start justify-between gap-3 md:gap-4">
        <div className="flex items-start gap-3 md:gap-4 flex-1">
          {icon && (
            <div
              className={`
                w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                ${selected ? "bg-spark/20 text-spark" : "bg-warmwhite/10 text-warmwhite-muted group-hover:bg-warmwhite/15"}
              `}
            >
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3
              className={`font-display text-base md:text-lg font-semibold mb-1 transition-colors ${
                selected ? "text-spark" : "text-warmwhite group-hover:text-spark"
              }`}
            >
              {title}
            </h3>
            <p className="text-warmwhite-muted text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <div
          className={`
            w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
            ${
              selected
                ? "border-spark bg-spark"
                : "border-warmwhite/30 group-hover:border-warmwhite/50"
            }
          `}
        >
          {selected && (
            <svg
              className="w-2.5 h-2.5 md:w-3 md:h-3 text-charcoal-dark"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
