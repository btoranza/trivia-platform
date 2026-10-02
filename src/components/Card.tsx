import type { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="border-brutal bg-surface p-5 shadow-lg">{children}</div>
  );
}
