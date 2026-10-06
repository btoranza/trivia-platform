import Link from "next/link";
import { levelHomeHref, randomHomeHref } from "@/lib/quiz-setup";
import { Chip } from "./Chip";

type Props = {
  label: string;
  backLabel: string;
  allLabel: string;
  lengths: readonly number[];
  /** The chosen length; null means "All". */
  selected: number | null;
  /** The level to go back to, and to keep while choosing a length. */
  difficulty: string;
};

/**
 * Replaces the level chips while in random mode: a chip back to the levels,
 * then the number of questions. Same row height as the level chips, so the
 * card does not grow or shift.
 */
export function LengthPicker({
  label,
  backLabel,
  allLabel,
  lengths,
  selected,
  difficulty,
}: Props) {
  const options: { text: string; value: number | null }[] = [
    ...lengths.map((n) => ({ text: String(n), value: n })),
    { text: allLabel, value: null },
  ];
  return (
    <div
      role="group"
      aria-label={label}
      className="mt-3 flex flex-wrap gap-2 md:mt-4"
    >
      <Link href={levelHomeHref(difficulty)} replace scroll={false}>
        <Chip variant="white">{backLabel}</Chip>
      </Link>
      {options.map((o) => {
        const active = o.value === selected;
        return (
          <Link
            key={o.text}
            href={randomHomeHref(difficulty, o.value)}
            replace
            scroll={false}
            aria-current={active ? "true" : undefined}
          >
            <Chip variant={active ? "inverted" : "white"}>{o.text}</Chip>
          </Link>
        );
      })}
    </div>
  );
}
