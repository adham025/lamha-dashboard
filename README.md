# Lamha — Admin Dashboard

The staff console for **Lamha** (spec §8). React 19 + Vite + TypeScript +
Tailwind 4 + TanStack Query/Table + Recharts + `@supabase/supabase-js`, deployed
on **Vercel**.

## Run locally

```bash
npm install
cp .env.example .env     # fill in the anon key
npm run dev
```

## Environment variables

| Var | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://sqfaiygsfphheoauxrpu.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | the project **anon** key (public, RLS-protected) |

> Only the anon key belongs here. The `service_role` key must never reach the
> browser bundle — server-only work (bulk reads, status transitions, moderation
> actions) goes through Supabase Edge Functions.

## Deploy to Vercel

1. Push this repo to GitHub (already wired to `adham025/lamha-dashboard`).
2. Vercel → **Add New → Project → Import** `lamha-dashboard`. Framework preset
   auto-detects **Vite** (build `npm run build`, output `dist`).
3. Add the two env vars above under **Settings → Environment Variables**.
4. Deploy. `vercel.json` already rewrites all routes to `index.html` for the SPA.

## What's here (spec §8)

- **Auth gate** — Supabase email/password sign-in; staff-only.
- **Sidebar shell** with every §8 section: Overview · AI usage & cost ·
  Orders · Users · Moderation queue · Subscriptions & revenue · Promotions ·
  Staff & roles · Settings.
- **Overview** — KPI cards + a subscriptions-vs-prints revenue chart (Recharts,
  sample data).
- Other sections are connected shells describing their planned data + actions.

## Next step to make the data live

Every page is already wired to Supabase, but the tables are protected by
owner-scoped RLS (see the app's `supabase/migrations/0001_init.sql`). To let an
admin read across all users, add a **staff-role** migration (a `staff` table +
policies granting staff `select`), or move aggregate reads into an admin Edge
Function using the service_role key. That single addition lights up Overview,
AI cost, Orders, Users, etc.
