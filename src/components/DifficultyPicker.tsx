import Link from "next/link";
import { levelHomeHref } from "@/lib/quiz-setup";
import { Chip } from "./Chip";

type Props = {
  label: string;
  options: readonly string[];
  selected: string;
  /** Last chip: opens random mode. */
  randomLabel: string;
  randomHref: string;
};

/** Link-based selector: the choice lives in the URL (?difficulty=...). */
export function DifficultyPicker({
  label,
  options,
  selected,
  randomLabel,
  randomHref,
}: Props) {
  return (
    <div
      role="group"
      aria-label={label}
      className="mt-3 flex flex-wrap gap-2 md:mt-4"
    >
      {options.map((option) => {
        const active = option === selected;
        return (
          <Link
            key={option}
            href={levelHomeHref(option)}
            replace
            scroll={false}
            aria-current={active ? "true" : undefined}
          >
            <Chip variant={active ? "inverted" : "white"}>{option}</Chip>
          </Link>
        );
      })}
      <Link href={randomHref} replace scroll={false}>
        <Chip variant="white">{randomLabel}</Chip>
      </Link>
    </div>
  );
}
