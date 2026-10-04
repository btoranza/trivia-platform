export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="border-brutal h-3.5 w-full md:h-[18px] bg-surface"
    >
      <div
        className="h-full border-r-[length:var(--border-w)] border-ink bg-accent"
        style={{ width: `${pct}%`, borderRightStyle: pct > 0 ? "solid" : "none" }}
      />
    </div>
  );
}
