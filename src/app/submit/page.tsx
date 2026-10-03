import { HomeLink } from "@/components/HomeLink";
import { SubmitForm } from "@/components/SubmitForm";
import { triviaConfig as config } from "@/config/trivia";

export default function SubmitPage() {
  return (
    <main className="mx-auto flex w-full flex-1 flex-col gap-6 md:max-w-5xl md:gap-5">
      <div>
        <HomeLink />
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
        <h1 className="font-display text-4xl uppercase leading-none tracking-tight">
          {config.form.title}
        </h1>
        <p className="text-lg font-bold md:max-w-xl md:text-right">
          {config.form.intro}
        </p>
      </div>
      <SubmitForm />
    </main>
  );
}
