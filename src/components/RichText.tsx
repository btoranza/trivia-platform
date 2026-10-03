import { parseRichText } from "@/lib/rich-text";

/** Renders `inline code` and ```fenced blocks``` inside otherwise plain text. */
export function RichText({ text }: { text: string }) {
  return parseRichText(text).map((part, i) => {
    if (part.type === "code") {
      return (
        <code
          key={i}
          className="border-2 border-ink bg-canvas px-1 font-mono text-[0.8em] font-bold text-ink"
        >
          {part.value}
        </code>
      );
    }
    if (part.type === "block") {
      return (
        <pre
          key={i}
          className="border-brutal my-3 overflow-x-auto bg-ink p-3 font-mono text-sm font-medium leading-snug tracking-normal text-canvas normal-case"
        >
          <code>{part.value}</code>
        </pre>
      );
    }
    return <span key={i}>{part.value}</span>;
  });
}
