"use client";

import { useState } from "react";
import { triviaConfig as config, type ResultTier } from "@/config/trivia";
import { formatShareText } from "@/lib/quiz";
import { Button } from "./Button";
import { Card } from "./Card";
import { HomeLink } from "./HomeLink";
import { ScoreBadge } from "./ScoreBadge";

type Props = {
  score: number;
  total: number;
  tier: ResultTier;
  onRestart: () => void;
};

export function Results({ score, total, tier, onRestart }: Props) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.origin;
    const text = formatShareText(config.shareText, {
      score,
      total,
      title: config.title,
      tier: tier.title,
      url,
    });
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Share dialog dismissed or clipboard unavailable: nothing to do.
    }
  }

  return (
    <main className="mx-auto flex w-full flex-1 flex-col items-center gap-7 text-center md:max-w-3xl">
      <div className="self-start">
        <HomeLink />
      </div>
      <p className="text-sm font-bold uppercase tracking-wide">
        {config.title} · {config.labels.resultsSuffix}
      </p>
      <div className="flex w-full flex-col items-center gap-7 md:my-auto md:flex-row md:gap-12">
        <div className="py-2 md:shrink-0 md:px-4">
          <ScoreBadge score={score} total={total} />
        </div>
        <div className="w-full text-left">
          <Card>
            <p className="text-sm font-bold uppercase tracking-wide">
              {config.labels.youAreA}
            </p>
            <h1 className="mt-1 font-display text-[38px] uppercase leading-none tracking-tight">
              {tier.title}
            </h1>
            <p className="mt-3 text-lg font-medium">{tier.message}</p>
          </Card>
        </div>
      </div>
      <div className="flex-1 md:hidden" />
      <div className="grid w-full grid-cols-2 gap-4 md:max-w-md">
        <Button variant="secondary" onClick={onRestart}>
          {config.labels.playAgain}
        </Button>
        <Button onClick={share}>
          <span aria-live="polite">
            {copied ? config.labels.copied : config.labels.share}
          </span>
        </Button>
      </div>
    </main>
  );
}
