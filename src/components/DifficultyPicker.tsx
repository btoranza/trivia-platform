import Link from "next/link";
import { Chip } from "./Chip";

type Props = {
  label: string;
  options: readonly string[];
  selected: string;
};

/** Link-based selector: the choice lives in the URL (?difficulty=...). */
export function DifficultyPicker({ label, options, selected }: Props) {
  return (
    <div role="group" aria-label={label} className="mt-3 flex flex-wrap gap-2 md:mt-4">
      {options.map((option) => {
        const active = option === selected;
        return (
          <Link
            key={option}
            href={`/?difficulty=${encodeURIComponent(option)}`}
            replace
            scroll={false}
            aria-current={active ? "true" : undefined}
          >
            <Chip variant={active ? "inverted" : "white"}>{option}</Chip>
          </Link>
        );
      })}
    </div>
  );
}
