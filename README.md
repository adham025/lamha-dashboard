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

## Sign in (test accounts)

Staff-only, email + password. A non-staff account gets a "No dashboard access"
screen.

| Role | Email | Password |
|------|-------|----------|
| Super admin | `adhamgalal70@gmail.com` | `Adham_2001` |
| Studio | `studio@lamha.app` | `Studio_123` |
| Support | `support@lamha.app` | `Support_123` |
| Print ops | `printops@lamha.app` | `Print_123` |

Nav and routes are **gated by role** — e.g. only super_admin sees *Studios &
roles* and *Settings*; print_ops sees only Overview + Orders.

## What's here (spec §8)

- **Auth gate + roles** — resolves the caller's `staff` role; filters nav and
  guards routes per role.
- **Overview / Users / Orders / AI usage & cost** — **live** from Supabase
  (real KPIs, tables, and per-model cost breakdown from the seeded data).
- **Studios & roles** (super_admin) — create operator accounts, change roles,
  enable/disable. Creation calls the `create-staff` Edge Function; role/disable
  changes go through RLS directly.
- **Moderation / Subscriptions / Promotions / Settings** — connected shells,
  next to be wired.

## Deploy the `create-staff` Edge Function (for the Create button)

Creating an auth user needs the service_role key, so it runs server-side:

```bash
cd ../Lamha          # the app repo holds supabase/functions
supabase login
supabase link --project-ref sqfaiygsfphheoauxrpu
supabase functions deploy create-staff
```

Until deployed, the create form shows a "not deployed yet" note; listing, role
changes and enable/disable already work.

## Next step to make the data live

Every page is already wired to Supabase, but the tables are protected by
owner-scoped RLS (see the app's `supabase/migrations/0001_init.sql`). To let an
admin read across all users, add a **staff-role** migration (a `staff` table +
policies granting staff `select`), or move aggregate reads into an admin Edge
Function using the service_role key. That single addition lights up Overview,
AI cost, Orders, Users, etc.
