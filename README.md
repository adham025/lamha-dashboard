# Lamha — Admin Dashboard

The staff console for **Lamha**, the photo-editing and print service. React 19 +
Vite + TypeScript + Tailwind 4 + TanStack Query/Table + Recharts +
`@supabase/supabase-js`, deployed on **Vercel**.

Staff run every order from here: confirm the customer's InstaPay deposit, take
the photo to a partner studio, upload the edit for the customer to review, then
print, deliver and record the cash collected. Prices, sizes and shop settings are
edited here too and reach the app immediately.

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
> browser bundle. Every order action goes through role-checked database
> functions (`staff_set_order_status`, `staff_attach_result`) — not through
> direct table writes.

## Deploy to Vercel

1. Push this repo to GitHub (wired to `adham025/lamha-dashboard`).
2. Vercel → **Add New → Project → Import** `lamha-dashboard`. Framework preset
   auto-detects **Vite** (build `npm run build`, output `dist`).
3. Add the two env vars above under **Settings → Environment Variables**.
4. Deploy. `vercel.json` already rewrites all routes to `index.html` for the SPA.

The public Privacy / Terms / Refund pages the app links to are served from this
site (`/legal/privacy`, `/legal/terms`, `/legal/refund`).

## Signing in

Staff sign in with email + password. A non-staff account sees a "No dashboard
access" screen. The owner (`super_admin`) creates everyone else under **Team**.
No credentials are kept in this repo.

## Roles and what each sees

| Role | Pages |
|------|-------|
| `support` — Payments & support | Payments, All orders, Customers, Uploads, Discounts, Notifications |
| `studio` — Editing | Editing, All orders, Customers, Uploads |
| `print_ops` — Print & delivery | Print & delivery, All orders |
| `super_admin` — Owner | Everything, plus Services & prices, Reports, Team, Settings |

The same limits are enforced in the database; hiding a button is only a courtesy.

## The order workflow

| Stage | Who | Where |
|-------|-----|-------|
| Customer sends the InstaPay screenshot | — | — |
| Approve or reject the payment | `support` | **Payments** |
| Take photos to a partner studio, mark as editing | `studio` | **Editing** |
| Upload the edited file(s), send for customer review | `studio` | **Editing** |
| Customer approves, or asks for changes (back to Editing) | customer | app |
| Print, mark out for delivery | `print_ops` | **Print & delivery** |
| Delivered — record cash collected | `print_ops` | **Print & delivery** |

Passport / ID orders get a sheet tool in the order panel that tiles the finished
4×6 cm photo onto a 300 dpi print sheet. The studio name and cost fields are
internal — customers never see them.

## Settings that run the shop

- **Settings → Payments**: the InstaPay address and account name shown to customers.
- **Settings → Orders**: accept new orders on/off; optional daily order cap.
- **Settings → Print & delivery**: deposit %, delivery fee, support WhatsApp.
- **Services & prices**: per-service on/off, extra edit fee and turnaround; print sizes and prices.
