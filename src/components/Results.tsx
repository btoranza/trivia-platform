"use client";

import { useState } from "react";
import { triviaConfig as config, type ResultTier } from "@/config/trivia";
import { formatTemplate } from "@/lib/quiz";
import { shareImagePath } from "@/lib/share-image";
import { Button } from "./Button";
import { Card } from "./Card";
import { HomeLink } from "./HomeLink";
import { ScoreBadge } from "./ScoreBadge";

type Props = {
  score: number;
  total: number;
  tier: ResultTier;
  /** The tier the score would have earned in a longer game, if any. */
  locked: ResultTier | null;
  onRestart: () => void;
};

type ShareStatus = "idle" | "working" | "copied" | "saved";

export function Results({ score, total, tier, locked, onRestart }: Props) {
  const [status, setStatus] = useState<ShareStatus>("idle");

  function flash(next: "copied" | "saved") {
    setStatus(next);
    setTimeout(() => setStatus("idle"), 2000);
  }

  /** Shares the results picture; falls back to plain text if it fails. */
  async function share() {
    if (status === "working") return;
    const text = formatTemplate(config.shareText, {
      score,
      total,
      title: config.title,
      tier: tier.title,
      url: window.location.origin,
    });

    setStatus("working");
    try {
      const res = await fetch(shareImagePath(score, total));
      if (!res.ok) throw new Error(`Image request failed: ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], `${config.slug}-results.png`, {
        type: "image/png",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
        setStatus("idle");
        return;
      }
      // No file sharing here (most desktops): save the picture instead.
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(link.href);
      flash("saved");
    } catch (err) {
      // The share sheet was dismissed: nothing else to do.
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
        return;
      }
      await shareText(text);
    }
  }

  /** Last resort when the picture cannot be made or shared. */
  async function shareText(text: string) {
    try {
      if (navigator.share) {
        await navigator.share({ text });
        setStatus("idle");
      } else {
        await navigator.clipboard.writeText(text);
        flash("copied");
      }
    } catch {
      setStatus("idle");
    }
  }

  return (
    <main className="mx-auto flex w-full flex-1 flex-col items-center gap-4 text-center md:gap-7 md:max-w-3xl">
      <div className="self-start">
        <HomeLink />
      </div>
      <div className="flex-1 md:hidden" />
      <p className="text-sm font-bold uppercase tracking-wide">
        {config.title} · {config.labels.resultsSuffix}
      </p>
      <div className="flex w-full flex-col items-center gap-4 md:my-auto md:flex-row md:gap-12">
        <div className="py-1 md:shrink-0 md:px-4 md:py-2">
          <ScoreBadge score={score} total={total} />
        </div>
        <div className="w-full text-left">
          <Card>
            <p className="text-sm font-bold uppercase tracking-wide">
              {config.labels.youAreA}
            </p>
            <h1 className="mt-1 font-display text-[30px] uppercase md:text-[38px] leading-none tracking-tight">
              {tier.title}
            </h1>
            <p className="mt-2 text-base font-medium md:mt-3 md:text-lg">
              {tier.message}
            </p>
            {locked && (
              <p className="mt-3 text-sm font-bold md:text-base">
                {formatTemplate(config.labels.tierLocked, {
                  tier: locked.title,
                  needed: locked.minQuestions ?? 0,
                })}
              </p>
            )}
          </Card>
        </div>
      </div>
      <div className="grid w-full grid-cols-2 gap-4 md:max-w-md">
        <Button variant="secondary" onClick={onRestart}>
          {config.labels.playAgain}
        </Button>
        <Button onClick={share} aria-disabled={status === "working"}>
          <span aria-live="polite">
            {status === "working"
              ? config.labels.sharing
              : status === "copied"
                ? config.labels.copied
                : status === "saved"
                  ? config.labels.saved
                  : config.labels.share}
          </span>
        </Button>
      </div>
      <div className="flex-1 md:hidden" />
    </main>
  );
}
