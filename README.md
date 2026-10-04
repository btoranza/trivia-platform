# Frontend Trivia

A quiz about JavaScript, TypeScript, CSS and HTML. No Googling. (We can tell.)

**[Play the live demo →](https://coding-trivia-bt.vercel.app/)**

Players pick a difficulty, answer a shuffled set of questions, learn something from each explanation and finish with a result tier ("Console.log Debugger" up to "Compiler") they can share. Anyone can submit a question; an admin reviews, edits and approves it before it joins the quiz.

<p align="center">
  <img src="docs/screenshots/home-desktop.png" alt="Home screen with difficulty picker" width="49%">
  <img src="docs/screenshots/quiz-answered-desktop.png" alt="An answered question with its explanation" width="49%">
</p>

## Features

- **Quiz** with Easy / Medium / Hard levels. Levels are cumulative: Medium includes the Easy questions, Hard includes everything.
- **Shuffled every game**: question order and answer order.
- **Explanations** after each answer, with the author's credit when there is one.
- **Result tiers and sharing**: a score badge, a tier title and a share button.
- **Inline code and code blocks** in questions, answers and explanations, using `` `backticks` `` and fenced blocks.
- **Public submission form** with validation and a honeypot field against bots. Submissions are stored as pending.
- **Admin page** (password protected) to edit a submission with a live preview, then save, approve or reject it.
- **Credits page** built from the credit names of approved questions. Anonymous questions are left out.
- **Responsive**: works on phones and desktops.

## Screenshots

| Screen | Desktop | Mobile |
| --- | --- | --- |
| Home | <img src="docs/screenshots/home-desktop.png" width="360"> | <img src="docs/screenshots/home-mobile.png" width="140"> |
| Question | <img src="docs/screenshots/quiz-question-desktop.png" width="360"> | <img src="docs/screenshots/quiz-question-mobile.png" width="140"> |
| Answered | <img src="docs/screenshots/quiz-answered-desktop.png" width="360"> | <img src="docs/screenshots/quiz-answered-mobile.png" width="140"> |
| Results | <img src="docs/screenshots/results-desktop.png" width="360"> | <img src="docs/screenshots/results-mobile.png" width="140"> |
| Submit a question | <img src="docs/screenshots/submit-desktop.png" width="360"> | <img src="docs/screenshots/submit-mobile.png" width="140"> |
| Credits | <img src="docs/screenshots/credits-desktop.png" width="360"> | <img src="docs/screenshots/credits-mobile.png" width="140"> |

The admin page is not pictured because it lists real pending submissions.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router, Server Actions) with React 19 and the React Compiler
- TypeScript
- [Tailwind CSS](https://tailwindcss.com) 4
- [Prisma](https://www.prisma.io) 7 with the `pg` driver adapter
- PostgreSQL, hosted on [Neon](https://neon.com)
- [Vitest](https://vitest.dev) for unit tests

## Getting started

### Prerequisites

- Node.js 20.9 or newer
- A PostgreSQL database. A free [Neon](https://neon.com) project works well.

### 1. Install

```bash
npm install
```

`postinstall` runs `prisma generate`, which creates the Prisma client in `src/generated/` (git-ignored).

### 2. Configure the environment

Create a `.env.local` file in the project root. It is git-ignored, and both Next.js and the Prisma CLI read it.

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
ADMIN_PASSWORD="choose-something-long"
```

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string. With Neon, copy it from the dashboard (**Connect**) and prefer the pooled connection. |
| `ADMIN_PASSWORD` | For `/admin` | Password for the admin page. If it is not set, the admin area stays closed and nobody can log in. |

The app makes the pg SSL mode explicit: `sslmode=prefer`, `require` and `verify-ca` are treated as `verify-full`, which is what `pg` does today (see [src/lib/db-url.ts](src/lib/db-url.ts)).

### 3. Set up the database

```bash
npx prisma migrate dev   # creates the tables
npx prisma db seed       # creates the quiz and loads the curated questions
```

The seed is safe to run again: everything is upserted by a stable id.

### 4. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

In development only, `/quiz?score=7` jumps straight to the results screen with a score of 7, which is handy for styling the tiers.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the unit tests once |
| `npx vitest` | Run the tests in watch mode |

## How it works

### The game

1. The home page reads the approved questions from the database and filters them by the chosen difficulty (`?difficulty=Easy|Medium|Hard`; an invalid value falls back to the default).
2. `/quiz` builds a game: it shuffles the questions, optionally limits how many to play, and shuffles each question's answers. The quiz page opts out of static rendering so every visit gets a fresh shuffle.
3. The player answers, sees the explanation, and at the end gets a score, a tier and a share text.

If no question matches the chosen difficulty, the full pool is used instead.

### Submitting and reviewing questions

```
/submit  ──►  QuestionSubmission (pending)  ──►  /admin  ──►  Question (approved)
                                                    └──────►  rejected
```

- The form takes a question, one correct answer, three wrong ones, an explanation, a difficulty and an optional credit name (or "stay anonymous").
- Limits: question 200 characters, each answer 100, explanation 400, credit name 40. Answers must be different from each other. See [src/lib/submissions.ts](src/lib/submissions.ts).
- In `/admin` the reviewer can edit the text with a live preview, then **save**, **approve** or **reject**. Approving copies the submission into the questions table inside a transaction, and it claims the submission first so a double click cannot create the question twice.
- The credit name is kept as the author submitted it. It is not editable in the admin.

### Admin authentication

There are no user accounts. `/admin` shows a password form; a correct password sets an `admin_session` cookie that is:

- signed with HMAC-SHA256 using the admin password, so changing `ADMIN_PASSWORD` logs everyone out,
- valid for 7 days,
- `httpOnly`, `SameSite=Lax`, scoped to `/admin`, and `Secure` in production.

Password and signature checks use constant-time comparison. Wrong passwords wait 600 ms before answering. See [src/lib/admin-auth.ts](src/lib/admin-auth.ts).

## Customizing the quiz

Almost all text and settings live in [src/config/trivia.ts](src/config/trivia.ts):

- `slug`, `title`, `description`
- `difficulties` (ordered from easiest to hardest) and `defaultDifficulty`
- `questionsPerGame` (a number, or `null` to play every question)
- every label, the form copy and its error messages
- `credits` groups (a group with `fromQuestions: true` is filled from the approved questions' credit names)
- result `tiers` (inclusive percentage ranges) and the `shareText` template

The `slug` must match the quiz row in the database; the seed creates it from this config.

### Adding curated questions

Add entries to [prisma/questions/frontend.json](prisma/questions/frontend.json) and run `npx prisma db seed`:

```json
{
  "id": "fe-39",
  "text": "What does `typeof null` return?",
  "difficulty": "Easy",
  "answers": ["`\"object\"`", "`\"null\"`", "`\"undefined\"`", "`\"number\"`"],
  "explanation": "A bug from the very first version of JavaScript..."
}
```

- The **first answer is always the correct one**; the quiz shuffles them.
- `id` must be unique and stable. Re-running the seed updates a question with the same id instead of duplicating it.
- Use `` `backticks` `` for inline code and triple backticks for code blocks. The text is stored as plain text and formatted only when displayed ([src/lib/rich-text.ts](src/lib/rich-text.ts)).

## Testing

```bash
npm test
```

The unit tests live next to the code they cover, in `src/lib/`:

| File | Covers |
| --- | --- |
| [submissions.test.ts](src/lib/submissions.test.ts) | Form validation: required fields, length limits, duplicate answers, difficulty, credit name |
| [quiz.test.ts](src/lib/quiz.test.ts) | Shuffling and game building, score percentage, result tiers, difficulty filtering, templates |
| [rich-text.test.ts](src/lib/rich-text.test.ts) | Inline code and fenced blocks, including unclosed ones |
| [admin-auth.test.ts](src/lib/admin-auth.test.ts) | Password check, session token creation, expiry and tampering |

The server actions are tested with the database and the Next.js helpers (`cookies`, `redirect`, `revalidatePath`) mocked, so no real database is needed:

| File | Covers |
| --- | --- |
| [submit/actions.test.ts](src/app/submit/actions.test.ts) | Saving a pending submission, validation errors, the honeypot, database failures |
| [admin/actions.test.ts](src/app/admin/actions.test.ts) | Login and logout, access without a session, save / approve / reject, and approving only once |

Database queries such as the credits list are not covered yet.

## Project structure

```
prisma/
  schema.prisma        Quiz, Question, Answer and QuestionSubmission models
  migrations/          SQL migrations
  seed.ts              Creates the quiz and loads the curated questions
  questions/           Curated questions as JSON
src/
  app/
    page.tsx           Home
    quiz/              The game
    submit/            Submission form and its server action
    admin/             Review page and its server actions
    credits/           Credits page
  components/          UI building blocks (Quiz, Results, SubmitForm, AdminReviewForm, ...)
  config/trivia.ts     Texts, difficulties, tiers and other settings
  lib/                 Game logic, validation, admin auth, database access
  types/               Shared types
docs/screenshots/      Images used in this README
```

## Deployment

The [live demo](https://coding-trivia-bt.vercel.app/) runs on [Vercel](https://vercel.com), but it is a standard Next.js app, so any Node host works. The steps are:

1. Set `DATABASE_URL` and `ADMIN_PASSWORD` in the project's environment variables.
2. Apply the migrations to the production database: `npx prisma migrate deploy`.
3. Seed it once: `npx prisma db seed`.

## Credits

Made by Berenice. Questions submitted by the community are credited on the app's `/credits` page.
