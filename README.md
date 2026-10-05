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
- **Result tiers and sharing**: a score badge, a tier title and a share button. Sharing creates a 1080×1920 picture of the result: on phones it opens the share sheet with the image attached, on computers it saves the PNG, and if the picture fails it falls back to plain text.
- **Link preview**: pasting the site's address in a chat or a post shows a card with the title and the logo.
- **Inline code and code blocks** in questions, answers and explanations, using `` `backticks` `` and fenced blocks.
- **Public submission form** with validation and a honeypot field against bots. Submissions are stored as pending.
- **Admin page** (password protected) to edit a submission with a live preview, then save, approve or reject it.
- **Feedback page** (`/feedback`): anyone can leave a note or recommendation, with an optional name. Notes are stored in the database and listed in `/admin`, where they can be marked as read (they move to a collapsible "Read notes" list), marked as unread again, or deleted for good after a confirmation.
- **Optional Discord notifications**: a short message with a link to `/admin` when a question or a note arrives (see [Notifications](#notifications-optional)).
- **Credits page** built from the credit names of approved questions. Anonymous questions are left out.
- **Responsive**: a compact layout on phones, designed so most screens fit without vertical scrolling (the submission form is the exception), and a roomier two-column layout on desktop.

## Screenshots

| Screen | Desktop | Mobile |
| --- | --- | --- |
| Home | <img src="docs/screenshots/home-desktop.png" width="360"> | <img src="docs/screenshots/home-mobile.png" width="140"> |
| Question | <img src="docs/screenshots/quiz-question-desktop.png" width="360"> | <img src="docs/screenshots/quiz-question-mobile.png" width="140"> |
| Answered | <img src="docs/screenshots/quiz-answered-desktop.png" width="360"> | <img src="docs/screenshots/quiz-answered-mobile.png" width="140"> |
| Results | <img src="docs/screenshots/results-desktop.png" width="360"> | <img src="docs/screenshots/results-mobile.png" width="140"> |
| Submit a question | <img src="docs/screenshots/submit-desktop.png" width="360"> | <img src="docs/screenshots/submit-mobile.png" width="140"> |
| Leave feedback | <img src="docs/screenshots/feedback-desktop.png" width="360"> | <img src="docs/screenshots/feedback-mobile.png" width="140"> |
| Credits | <img src="docs/screenshots/credits-desktop.png" width="360"> | <img src="docs/screenshots/credits-mobile.png" width="140"> |

The admin page is not pictured because it lists real pending submissions and feedback notes.

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
| `DISCORD_WEBHOOK_URL` | No | Discord channel webhook for new-question and new-note alerts. Leave it out locally to keep development quiet. |
| `SITE_URL` | No | Public address used in those alerts and in the link-preview image URLs. Defaults to the production domain Vercel provides. |

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

In development only, two shortcuts help with styling: `/quiz?score=7` jumps straight to the results screen with a score of 7, and `/quiz?question=<id>` plays just that question (by id, whatever its difficulty).

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
3. The player answers, sees the explanation, and at the end gets a score and a tier, and can share the result as a picture.

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

### Feedback

```
/feedback  ──►  Feedback (unread)  ──►  /admin  ──►  read  ◄──►  unread
                                                      └──────►  deleted
```

- The form takes a note (up to 500 characters) and an optional credit name (up to 40), with the same honeypot as the question form. See [src/lib/feedback.ts](src/lib/feedback.ts).
- In `/admin`, unread notes are listed under **Feedback**. **Mark as read** moves a note to a collapsible **Read notes** list, where it stays stored and can be marked as unread again.
- **Delete** removes a note from the database for good, after a confirmation dialog.

### Share image and link preview

- `GET /api/share-image?score=42&total=48` draws the results picture with [next/og](https://nextjs.org/docs/app/api-reference/functions/image-response). The tier is worked out on the server from the score, so the address cannot be used to put arbitrary text in the image. Invalid values answer 400 (see [src/lib/share-image.ts](src/lib/share-image.ts)). The picture only depends on the query string, so it is cached for a year.
- `src/app/opengraph-image.tsx` makes the card shown when the site's link is pasted. `metadataBase` in the layout comes from `SITE_URL`, or from the production domain Vercel provides.
- Both images use the TTF fonts in `src/assets/fonts/` (Archivo Black and Space Grotesk, both under the SIL Open Font License), because `next/og` cannot read the web fonts the pages use. Their colors live in [src/lib/image-theme.ts](src/lib/image-theme.ts), because `next/og` cannot read CSS variables; a test checks they match the tokens in `globals.css`. The logo is read from `src/app/icon.svg`.

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
- every label, the form copy (for questions and for feedback) and its error messages (`explanationRight` and `explanationWrong` are lists: one phrase is picked at random after each answer, never the same twice in a row)
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
- `creditName` is optional: add it to credit the person who suggested the question (it shows under the explanation and on the credits page).
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
| [quiz.test.ts](src/lib/quiz.test.ts) | Shuffling and game building, random answer phrases, the single-question game, score percentage, result tiers (including that they cover 0–100), difficulty filtering, templates |
| [feedback.test.ts](src/lib/feedback.test.ts) | Feedback validation: required message, length limits, anonymous and blank names |
| [share-image.test.ts](src/lib/share-image.test.ts) | Score parameters accepted and rejected for the results picture |
| [image-theme.test.ts](src/lib/image-theme.test.ts) | The image colors match the tokens in `globals.css` |
| [notify.test.ts](src/lib/notify.test.ts) | Discord notifications: no-op without a webhook, message and link, never throwing |
| [site-url.test.ts](src/lib/site-url.test.ts) | Site address from `SITE_URL` or the Vercel domain, ignoring empty values |
| [rich-text.test.ts](src/lib/rich-text.test.ts) | Inline code and fenced blocks, including unclosed ones |
| [admin-auth.test.ts](src/lib/admin-auth.test.ts) | Password check, session token creation, expiry and tampering |

The server actions are tested with the database and the Next.js helpers (`cookies`, `redirect`, `revalidatePath`) mocked, so no real database is needed:

| File | Covers |
| --- | --- |
| [submit/actions.test.ts](src/app/submit/actions.test.ts) | Saving a pending submission, validation errors, the honeypot, database failures, notifications |
| [feedback/actions.test.ts](src/app/feedback/actions.test.ts) | Saving a note, validation errors, the honeypot, database failures, notifications |
| [admin/actions.test.ts](src/app/admin/actions.test.ts) | Login and logout, access without a session, save / approve / reject, approving only once, and feedback read / unread / delete |

Database queries such as the credits list are not covered yet.

GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs the type check, lint and tests on every push to `main` and on pull requests. No secrets are needed, since the tests never connect to a database. To run the same checks locally:

```bash
npx next typegen && npx tsc --noEmit && npm run lint && npm test
```

`next typegen` creates the `PageProps` and `LayoutProps` types that the type check relies on. `npm run dev` and `npm run build` also create them.

## Project structure

```
prisma/
  schema.prisma        Quiz, Question, Answer, QuestionSubmission and Feedback models
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
    feedback/          Feedback form and its server action
    api/share-image/   Results picture for sharing
    opengraph-image.tsx  Link preview card
  components/          UI building blocks (Quiz, Results, SubmitForm, AdminReviewForm, ...)
  config/trivia.ts     Texts, difficulties, tiers and other settings
  assets/fonts/        TTF fonts for the generated images
  lib/                 Game logic, validation, admin auth, notifications, share image, database access
  types/               Shared types
docs/screenshots/      Images used in this README
```

## Deployment

The [live demo](https://coding-trivia-bt.vercel.app/) runs on [Vercel](https://vercel.com), but it is a standard Next.js app, so any Node host works. The steps are:

1. Set `DATABASE_URL` and `ADMIN_PASSWORD` in the project's environment variables. Optionally set `DISCORD_WEBHOOK_URL` to get a Discord message whenever a question or a feedback note arrives (see below).
2. Apply the migrations to the production database: `npx prisma migrate deploy`. Use the direct (non-pooler) connection string for this. When a release adds a migration, apply it **before** deploying the new code, or the pages that use the new table will fail.
3. Seed it once: `npx prisma db seed`.

### Notifications (optional)

Set `DISCORD_WEBHOOK_URL` to a Discord channel webhook and the site posts a short message, with a link to `/admin`, each time someone submits a question or leaves a note. The visitor's text is never sent to Discord. Without the variable nothing is sent, so local development stays quiet. The link uses `SITE_URL` if set, and otherwise the production domain that Vercel provides.

## Credits

Made by Berenice. Questions submitted by the community are credited on the app's `/credits` page.
