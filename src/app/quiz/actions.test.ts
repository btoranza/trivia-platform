import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  quiz: { findUnique: vi.fn() },
  quizPlay: { create: vi.fn() },
}));
vi.mock("@/lib/db", () => ({ db }));

import { triviaConfig } from "@/config/trivia";
import { recordPlay } from "@/app/quiz/actions";

const valid = { score: 7, total: 10, random: false, difficulty: "Hard" };

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  db.quiz.findUnique.mockResolvedValue({ id: "quiz-1" });
  db.quizPlay.create.mockResolvedValue({});
});

describe("recordPlay", () => {
  it("stores a valid game with nothing about the player", async () => {
    await recordPlay(valid);

    expect(db.quiz.findUnique).toHaveBeenCalledWith({
      where: { slug: triviaConfig.slug },
    });
    expect(db.quizPlay.create).toHaveBeenCalledWith({
      data: {
        quizId: "quiz-1",
        score: 7,
        total: 10,
        random: false,
        difficulty: "Hard",
      },
    });
  });

  it("ignores data that is not a sane result", async () => {
    await recordPlay({ ...valid, score: 99 });
    await recordPlay(null);
    await recordPlay({ ...valid, difficulty: "Nightmare" });

    expect(db.quizPlay.create).not.toHaveBeenCalled();
  });

  it("drops fields it does not know about", async () => {
    await recordPlay({ ...valid, name: "someone", ip: "1.2.3.4" });

    const data = db.quizPlay.create.mock.calls[0][0].data;
    expect(Object.keys(data).sort()).toEqual(
      ["difficulty", "quizId", "random", "score", "total"].sort(),
    );
  });

  it("does nothing when the quiz is missing", async () => {
    db.quiz.findUnique.mockResolvedValue(null);

    await recordPlay(valid);

    expect(db.quizPlay.create).not.toHaveBeenCalled();
  });

  it("never throws when saving fails", async () => {
    db.quizPlay.create.mockRejectedValue(new Error("db down"));

    await expect(recordPlay(valid)).resolves.toBeUndefined();
  });
});
