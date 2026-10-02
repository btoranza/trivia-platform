import Link from "next/link";
import { Chip } from "./Chip";

type Props = {
  label: string;
  options: readonly string[];
  randomLabel: string;
  /** Selected difficulty, or null for random. */
  selected: string | null;
};

/** Link-based selector: the choice lives in the URL (?difficulty=...). */
export function DifficultyPicker({
  label,
  options,
  randomLabel,
  selected,
}: Props) {
  const items = [
    ...options.map((o) => ({ text: o, value: o as string | null })),
    { text: randomLabel, value: null },
  ];
  return (
    <div role="group" aria-label={label} className="mt-4 flex flex-wrap gap-2">
      {items.map(({ text, value }) => {
        const active = value === selected;
        const href = value ? `/?difficulty=${encodeURIComponent(value)}` : "/";
        return (
          <Link
            key={text}
            href={href}
            replace
            scroll={false}
            aria-current={active ? "true" : undefined}
          >
            <Chip variant={active ? "inverted" : "white"}>{text}</Chip>
          </Link>
        );
      })}
    </div>
  );
}
