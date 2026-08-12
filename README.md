
# Thread — private CRM

A single-user CRM for tracking sales leads from first contact through to
customer. Vite + React + Tailwind on the frontend, Supabase (Postgres + Auth)
as the backend. No server code — it's a pure client-side SPA that talks to
Supabase directly.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Once it's up, open **SQL Editor → New query**, paste in the contents of
   `thread-crm-schema.sql` (in this repo), and run it. This creates the
   `accounts`, `contacts`, `leads`, `stage_history`, `interactions`, and
   `agent_tasks` tables with row-level security tied to `auth.uid()`, so only
   you can ever read or write your own rows.
3. Under **Authentication → Providers**, make sure **Email** is enabled
   (it is by default).
4. Create your account either from the app's own **Sign up** link on the
   login screen, or from **Authentication → Users → Add user** in the
   dashboard — both work. RLS means every user only ever sees their own
   data, so if this is deployed publicly, anyone who signs up gets their
   own empty, isolated CRM.

## 2. Configure environment variables

Copy the example env file:

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and fill in the two values from your Supabase
project's **Settings → API** page:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

`.env.local` is gitignored — it will never be committed.

## 3. Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`), sign in with
the user you created in step 1.4, and you're in.

## 4. Deploy

This is a static SPA (no server-side code), so either of these work fine —
pick whichever you prefer later:

**Vercel**
- Import the repo in Vercel, framework preset "Vite".
- Build command: `npm run build`, output directory: `dist`.
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment
  variables in the Vercel project settings.

**GitHub Pages**
- Run `npm run build` to produce `dist/`.
- Publish `dist/` to a `gh-pages` branch (e.g. via the `gh-pages` npm
  package, or a GitHub Actions workflow).
- Since GitHub Pages has no environment variable injection at request time,
  the `VITE_SUPABASE_*` values get baked into the build at build time —
  set them as repo/Actions secrets and pass them to `npm run build` in CI.
- If deploying to a subpath (`username.github.io/repo-name`), set `base` in
  `vite.config.js` accordingly.

Either way, remember the Supabase anon key is meant to be public (it's
constrained entirely by the row-level security policies in the schema) —
what it's not okay to do is skip running the RLS policies from
`thread-crm-schema.sql`.

## How it's organized

- `src/lib/supabaseClient.js` — Supabase client, reads env vars.
- `src/lib/api.js` — all reads/writes against the schema (accounts,
  contacts, leads, stage_history, interactions, agent_tasks).
- `src/lib/constants.js` — shared colors, stage list, date helpers.
- `src/context/AuthContext.jsx` — session state, sign in/out.
- `src/components/` — Login, Sidebar, Dashboard, LeadsList, LeadDetail,
  NewLeadModal, and shared UI atoms (Card, StagePill, StageRail, etc.).

## Notes on the agents panel

- **Research company** / **Look up contact** log directly as a `note`
  interaction with clearly-labeled placeholder text — this is the seam
  where real AI calls get wired in later (see `runResearchAgent` /
  `runContactLookupAgent` in `src/lib/api.js`).
- **Draft a message** only ever creates a row in `agent_tasks` with
  `status = 'pending_approval'`. It is never logged as a sent message and
  never shown to the contact. Only clicking **Approve** in the approval
  queue logs it as an actual `message` interaction; **Discard** marks the
  task `discarded` and it disappears from the queue. Nothing is sent
  without that explicit approval step.

# thread-crm
 c733d7f813e90b14fe53e8942b8b1c14996fc48a
