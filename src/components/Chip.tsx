import type { ReactNode } from "react";

type Variant = "white" | "inverted" | "accent" | "correct";

const variants: Record<Variant, string> = {
  white: "bg-surface text-ink",
  inverted: "bg-ink text-canvas",
  accent: "bg-accent text-ink",
  correct: "bg-ink text-correct",
};

export function Chip({
  variant = "white",
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <span
      className={`border-brutal inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold uppercase tracking-wide ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
