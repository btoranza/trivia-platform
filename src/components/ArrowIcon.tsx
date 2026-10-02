/** Chunky square-cap arrow that matches the 3px borders. Inherits text color. */
export function ArrowIcon({
  direction = "right",
  className = "size-5",
}: {
  direction?: "right" | "left";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className={`shrink-0 ${direction === "left" ? "-scale-x-100" : ""} ${className}`}
    >
      <path d="M3 12h17M13 5l7 7-7 7" />
    </svg>
  );
}
