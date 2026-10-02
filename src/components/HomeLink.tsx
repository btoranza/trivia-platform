import Link from "next/link";
import { triviaConfig as config } from "@/config/trivia";

export function HomeLink() {
  return (
    <Link
      href="/"
      className="press border-brutal inline-flex h-10 items-center rounded-pill bg-surface px-4 text-sm font-bold uppercase tracking-wide text-ink"
    >
      {config.labels.home}
    </Link>
  );
}
