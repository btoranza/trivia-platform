import { FeedbackForm } from "@/components/FeedbackForm";
import { HomeLink } from "@/components/HomeLink";
import { triviaConfig as config } from "@/config/trivia";

export default function FeedbackPage() {
  return (
    <main className="mx-auto flex w-full flex-1 flex-col gap-4 md:max-w-2xl md:gap-5">
      <div>
        <HomeLink />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl uppercase md:text-4xl leading-none tracking-tight">
          {config.feedback.title}
        </h1>
        <p className="text-base font-bold md:text-lg">
          {config.feedback.intro}
        </p>
      </div>
      <FeedbackForm />
    </main>
  );
}
