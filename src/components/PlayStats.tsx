import type { PlayStats } from "@/lib/plays";
import { Card } from "./Card";

const label = "text-xs font-bold uppercase tracking-wide";
const big = "mt-1 font-display text-4xl leading-none";

/** The numbers about finished games, for the admin page. */
export function PlayStatsPanel({ stats }: { stats: PlayStats }) {
  if (stats.total === 0) {
    return <p className="text-lg font-bold">No games played yet.</p>;
  }
  const share = (n: number) => `${Math.round((n / stats.total) * 100)}%`;

  return (
    <div className="grid gap-4 md:grid-cols-3 md:gap-6">
      <Card>
        <p className={label}>Games played</p>
        <p className={big}>{stats.total}</p>
        <p className="mt-3 text-sm font-bold">
          {stats.last24h} in the last 24 hours
          <br />
          {stats.last7d} in the last 7 days
        </p>
      </Card>
      <Card>
        <p className={label}>Average score</p>
        <p className={big}>{stats.averagePercent}%</p>
        <p className="mt-3 text-sm font-bold">
          Random mode: {stats.random} ({share(stats.random)})
          <br />
          Level mode: {stats.levels} ({share(stats.levels)})
        </p>
        <ul className="mt-1 text-sm font-medium">
          {stats.byDifficulty.map((d) => (
            <li key={d.difficulty}>
              {d.difficulty}: {d.count}
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <p className={label}>Ranks reached</p>
        <ul className="mt-2 flex flex-col gap-1 text-sm font-bold">
          {stats.byTier.map((t) => (
            <li key={t.title} className="flex justify-between gap-3">
              <span>{t.title}</span>
              <span>
                {t.count} ({share(t.count)})
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
