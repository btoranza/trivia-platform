export function ScoreBadge({ score, total }: { score: number; total: number }) {
  return (
    <div
      role="img"
      aria-label={`Score: ${score} out of ${total}`}
      className="border-brutal flex size-[260px] -rotate-6 items-center justify-center rounded-pill bg-accent font-display text-[72px] leading-none text-ink shadow-badge"
    >
      {score}/{total}
    </div>
  );
}
