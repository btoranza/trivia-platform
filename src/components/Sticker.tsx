import type { ReactNode } from "react";

export function Sticker({ children }: { children: ReactNode }) {
  return (
    <span className="border-brutal inline-block -rotate-4 rounded-pill bg-accent px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-ink shadow-sm">
      {children}
    </span>
  );
}
