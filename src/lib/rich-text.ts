export type RichPart =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "block"; value: string };

const FENCE = /```[\w-]*\n([\s\S]*?)\n?```/g;
const INLINE = /`([^`\n]+)`/g;

/**
 * Splits plain text into text, `inline code` and ```fenced blocks```.
 * Stored text stays plain; this only decides how to display it.
 */
export function parseRichText(text: string): RichPart[] {
  const parts: RichPart[] = [];

  const pushInline = (chunk: string) => {
    let last = 0;
    for (const match of chunk.matchAll(INLINE)) {
      if (match.index > last) {
        parts.push({ type: "text", value: chunk.slice(last, match.index) });
      }
      parts.push({ type: "code", value: match[1] });
      last = match.index + match[0].length;
    }
    if (last < chunk.length) {
      parts.push({ type: "text", value: chunk.slice(last) });
    }
  };

  let last = 0;
  for (const match of text.matchAll(FENCE)) {
    if (match.index > last) pushInline(text.slice(last, match.index));
    parts.push({ type: "block", value: match[1] });
    last = match.index + match[0].length;
  }
  if (last < text.length) pushInline(text.slice(last));
  return parts;
}
