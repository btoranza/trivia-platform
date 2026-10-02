import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { DifficultyPicker } from "@/components/DifficultyPicker";
import { Sticker } from "@/components/Sticker";
import { triviaConfig as config } from "@/config/trivia";
import { getQuestions } from "@/lib/questions";
import {
  filterByDifficulty,
  formatTemplate,
  includedDifficulties,
  parseDifficulty,
} from "@/lib/quiz";

export default async function Home({ searchParams }: PageProps<"/">) {
  const difficulty = parseDifficulty(
    (await searchParams).difficulty,
    config.difficulties,
  );
  const pool = filterByDifficulty(
    await getQuestions(config.slug),
    difficulty,
    config.difficulties,
  );
  const count = Math.min(pool.length, config.questionsPerGame);
  const difficultyInfo = formatTemplate(
    difficulty
      ? config.labels.difficultyInfo
      : config.labels.difficultyInfoRandom,
    {
      count,
      levels: includedDifficulties(difficulty, config.difficulties).join(" + "),
    },
  );
  const quizHref = difficulty
    ? `/quiz?difficulty=${encodeURIComponent(difficulty)}`
    : "/quiz";
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
          <DifficultyPicker
            label={config.labels.chooseDifficulty}
            options={config.difficulties}
            randomLabel={config.labels.randomDifficulty}
            selected={difficulty}
          />
          <p className="mt-3 text-sm font-bold">{difficultyInfo}</p>
        </Card>
      </div>
      <div className="flex-1 md:hidden" />
      <div className="flex flex-col gap-4 md:col-start-2">
        <Button href={quizHref}>{config.labels.start}</Button>
        <Button href="/submit" variant="secondary">
          {config.labels.submit}
        </Button>
      </div>
      <p className="text-center text-sm font-bold md:col-start-2">
        {count} questions · {config.labels.credit}
      </p>
    </main>
  );
}
