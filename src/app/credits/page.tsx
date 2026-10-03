import { connection } from "next/server";
import { Card } from "@/components/Card";
import { HomeLink } from "@/components/HomeLink";
import { triviaConfig as config } from "@/config/trivia";
import { getCreditNames } from "@/lib/credits";

export default async function CreditsPage() {
  // Names come from the database, so render on every request.
  await connection();
  const submitters = await getCreditNames(config.slug);

  const groups = config.credits
    .map((group) => ({
      role: group.role,
      names: group.fromQuestions ? submitters : group.names,
    }))
    .filter((group) => group.names.length > 0);

  return (
    <main className="mx-auto flex w-full flex-1 flex-col gap-6 md:max-w-2xl">
      <div>
        <HomeLink />
      </div>
      <h1 className="font-display text-5xl uppercase leading-none tracking-tight">
        {config.labels.credits}
      </h1>
      {groups.map((group) => (
        <Card key={group.role}>
          <h2 className="text-xs font-bold uppercase tracking-wide">
            {group.role}
          </h2>
          <ul className="mt-2 flex flex-col gap-1 text-xl font-bold">
            {group.names.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </Card>
      ))}
    </main>
  );
}
