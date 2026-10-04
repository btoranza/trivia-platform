"use client";

import { useState } from "react";
import { triviaConfig as config, type ResultTier } from "@/config/trivia";
import { formatTemplate } from "@/lib/quiz";
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
    const text = formatTemplate(config.shareText, {
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
            <p className="mt-2 text-base font-medium md:mt-3 md:text-lg">{tier.message}</p>
          </Card>
        </div>
      </div>
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
      <div className="flex-1 md:hidden" />
    </main>
  );
}
