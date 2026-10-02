import { Card } from "@/components/Card";
import { HomeLink } from "@/components/HomeLink";
import { triviaConfig as config } from "@/config/trivia";

export default function CreditsPage() {
  return (
    <main className="mx-auto flex w-full flex-1 flex-col gap-6 md:max-w-2xl">
      <div>
        <HomeLink />
      </div>
      <h1 className="font-display text-5xl uppercase leading-none tracking-tight">
        {config.labels.credits}
      </h1>
      {config.credits.map((group) => (
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
