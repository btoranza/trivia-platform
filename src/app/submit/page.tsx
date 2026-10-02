import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { triviaConfig as config } from "@/config/trivia";

export default function SubmitPage() {
  return (
    <main className="flex flex-1 flex-col gap-6">
      <h1 className="font-display text-4xl uppercase leading-none tracking-tight">
        {config.labels.submitTitle}
      </h1>
      <Card>
        <p className="text-lg font-bold">{config.labels.submitPlaceholder}</p>
      </Card>
      <div className="flex-1" />
      <Button href="/" variant="secondary">
        {config.labels.back}
      </Button>
    </main>
  );
}
