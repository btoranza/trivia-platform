import { HomeLink } from "@/components/HomeLink";
import { SubmitForm } from "@/components/SubmitForm";
import { triviaConfig as config } from "@/config/trivia";

export default function SubmitPage() {
  return (
    <main className="mx-auto flex w-full flex-1 flex-col gap-6 md:max-w-2xl">
      <div>
        <HomeLink />
      </div>
      <h1 className="font-display text-4xl uppercase leading-none tracking-tight">
        {config.form.title}
      </h1>
      <p className="text-lg font-bold">{config.form.intro}</p>
      <SubmitForm />
    </main>
  );
}
