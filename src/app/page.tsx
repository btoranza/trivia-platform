import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { Sticker } from "@/components/Sticker";
import { triviaConfig as config } from "@/config/trivia";

export default function Home() {
  const lastDifficulty = config.difficulties.length - 1;
  return (
    <main className="flex flex-1 flex-col gap-6 md:grid md:flex-none md:grid-cols-2 md:content-center md:gap-x-14 md:gap-y-6 md:my-auto">
      <div className="flex flex-col gap-6 md:col-start-1 md:row-span-3 md:justify-center">
        <div>
          <Sticker>{config.labels.sticker}</Sticker>
        </div>
        <h1 className="font-display text-[clamp(44px,16vw,68px)] md:text-[72px] uppercase leading-[0.95] tracking-tight">
          {config.title.split(" ").map((word) => (
            <span key={word} className="block">
              {word}
            </span>
          ))}
        </h1>
      </div>
      <div className="md:col-start-2">
        <Card>
          <p className="text-xl font-bold">{config.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {config.difficulties.map((d, i) => (
              <Chip
                key={d}
                variant={i === lastDifficulty ? "inverted" : "white"}
              >
                {d}
              </Chip>
            ))}
          </div>
        </Card>
      </div>
      <div className="flex-1 md:hidden" />
      <div className="flex flex-col gap-4 md:col-start-2">
        <Button href="/quiz">{config.labels.start}</Button>
        <Button href="/submit" variant="secondary">
          {config.labels.submit}
        </Button>
      </div>
      <p className="text-center text-sm font-bold md:col-start-2">
        {config.questionsPerGame} questions · {config.labels.credit}
      </p>
    </main>
  );
}
