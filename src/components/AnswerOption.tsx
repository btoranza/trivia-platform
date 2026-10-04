import { Chip } from "./Chip";
import { RichText } from "./RichText";

export type AnswerState = "default" | "correct" | "wrong" | "idle";

type Props = {
  text: string;
  state: AnswerState;
  /** True once the answer has been revealed; no more interaction. */
  locked: boolean;
  /** Whether this was the option the player picked. */
  selected: boolean;
  correctLabel: string;
  wrongLabel: string;
  onSelect: () => void;
};

const states: Record<AnswerState, string> = {
  default: "bg-surface text-ink",
  idle: "bg-surface text-ink",
  correct: "bg-correct text-ink",
  wrong: "bg-ink text-surface line-through",
};

export function AnswerOption({
  text,
  state,
  locked,
  selected,
  correctLabel,
  wrongLabel,
  onSelect,
}: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-disabled={locked}
      data-sunk={state === "wrong"}
      onClick={() => {
        if (!locked) onSelect();
      }}
      className={`press border-brutal flex min-h-12 w-full items-center justify-between gap-3 px-4 py-2 text-left text-base font-bold md:min-h-16 md:py-3 md:text-lg ${states[state]} ${locked ? "cursor-default" : ""}`}
    >
      <span>
        <RichText text={text} />
      </span>
      {state === "correct" && <Chip variant="correct">{correctLabel}</Chip>}
      {state === "wrong" && <Chip variant="accent">{wrongLabel}</Chip>}
    </button>
  );
}
