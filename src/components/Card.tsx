import type { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="border-brutal bg-surface p-4 shadow-lg md:p-5">{children}</div>
  );
}
