import Link from "next/link";
import { ArrowIcon } from "./ArrowIcon";
import { triviaConfig as config } from "@/config/trivia";

export function HomeLink() {
  return (
    <Link
      href="/"
      className="press border-brutal inline-flex h-9 items-center md:h-10 gap-2 rounded-pill bg-surface px-4 text-sm font-bold uppercase tracking-wide text-ink"
    >
      <ArrowIcon direction="left" className="size-4" />
      {config.labels.home}
    </Link>
  );
}
