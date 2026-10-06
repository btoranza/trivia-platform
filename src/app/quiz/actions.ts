"use server";

import { triviaConfig as config } from "@/config/trivia";
import { db } from "@/lib/db";
import { validatePlay } from "@/lib/plays";

/**
 * Saves one finished game (score, mode and level, nothing about the player).
 * It never throws: a failure here must not get in the way of the results.
 */
export async function recordPlay(input: unknown): Promise<void> {
  const play = validatePlay(input, config.difficulties);
  if (!play) return;
  try {
    const quiz = await db.quiz.findUnique({ where: { slug: config.slug } });
    if (!quiz) return;
    await db.quizPlay.create({ data: { quizId: quiz.id, ...play } });
  } catch (err) {
    console.error("Failed to record a play", err);
  }
}
