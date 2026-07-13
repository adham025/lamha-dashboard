import { Placeholder } from '../components/ui'

// The remaining §8 sections. Each is a connected shell (Supabase client + auth
// already live); the data tables/mutations layer in once staff-role RLS exists.

export function AiCost() {
  return (
    <Placeholder
      title="AI usage & cost"
      subtitle="The dashboard that protects your margin (§8)."
      isNew
      source="spec §8 · §5 · §12"
      points={[
        'Live spend by model/provider — Replicate vs Gemini vs remove.bg (from ai_jobs.cost_usd).',
        'Cost-per-user trend and daily total, charted with Recharts.',
        'Alert threshold when daily spend spikes above a configurable limit.',
      ]}
    />
  )
}

export function Orders() {
  return (
    <Placeholder
      title="Orders"
      subtitle="Print/physical order queue, deposit → COD (§4.8, §6, §8)."
      source="spec §8 · §10 print_orders"
      points={[
        'State machine: deposit_paid → in_production → shipped → delivered / refused / cancelled.',
        'Filter by Standard vs Express to prioritise tighter delivery promises.',
        'Courier tracking number + destination address inline; a "refused/unclaimed" state for forfeited deposits.',
      ]}
    />
  )
}

export function Users() {
  return (
    <Placeholder
      title="Users"
      subtitle="Accounts, tiers, lifetime spend (§8)."
      source="spec §8 · §10 profiles"
      points={[
        'Search/filter accounts; view subscription tier and lifetime spend.',
        'Filter guest (anonymous) vs signed-up to track conversion past the guest stage.',
        'Ban/suspend actions (service-role Edge Function).',
      ]}
    />
  )
}

export function Moderation() {
  return (
    <Placeholder
      title="Moderation queue"
      subtitle="Human review before any print ships (§8, §9)."
      isNew
      source="spec §8 · §9"
      points={[
        'Auto-flagged uploads/outputs (NSFW/SafeSearch) awaiting review.',
        'Approve / reject; nothing is silently processed or silently deleted.',
        'Protects the AdMob account and satisfies store review for photo-upload apps.',
      ]}
    />
  )
}

export function Subscriptions() {
  return (
    <Placeholder
      title="Subscriptions & revenue"
      subtitle="RevenueCat-fed active/churned subscribers, MRR trend (§8)."
      source="spec §8 · §10 subscriptions"
      points={[
        'Table of active/churned subscribers fed by the RevenueCat webhook.',
        'MRR trend via Recharts.',
        'Plus/Pro split and net-of-store-cut margins (§12).',
      ]}
    />
  )
}

export function Promotions() {
  return (
    <Placeholder
      title="Promotions"
      subtitle="Referral codes, discounts, first-print-free (§8)."
      source="spec §8 · §10 referrals"
      points={[
        'Referral codes and two-sided reward tracking.',
        'Discount codes and first-print-free campaigns.',
        'Same shape as Hafla’s promotions feature.',
      ]}
    />
  )
}

export function Staff() {
  return (
    <Placeholder
      title="Staff & roles"
      subtitle="Admin/support/print-ops roles (§8)."
      source="spec §8"
      points={[
        'Role-based access: admin, support, print-ops.',
        'Same RLS-role pattern as Hafla’s dashboard_roles migration — this also unlocks live data on every page above.',
        'Invite/remove staff.',
      ]}
    />
  )
}

export function Settings() {
  return (
    <Placeholder
      title="Settings"
      subtitle="Dynamic app config (§8)."
      source="spec §8"
      points={[
        'Free-tier credit counts, ad content rating, print-partner details.',
        'Dynamic config table — same pattern as Hafla’s dynamic_app_configuration.',
        'Editable without a redeploy.',
      ]}
    />
  )
}
