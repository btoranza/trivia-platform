/** Chunky exclamation mark in a circle, same stroke style as ArrowIcon. */
export function AlertIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.5}
      strokeLinecap="square"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 7v6.5M12 17v.5" />
    </svg>
  );
}
