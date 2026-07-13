import { Placeholder } from '../components/ui'

// Sections still to be wired to live data / mutations. Overview, Users, Orders,
// AI cost and Studios are already real (see their own files).

export function Moderation() {
  return (
    <Placeholder
      title="Moderation queue"
      subtitle="Human review before any print ships (§8, §9)."
      isNew
      source="spec §8 · §9"
      points={[
        'Auto-flagged uploads/outputs (NSFW/SafeSearch) awaiting review — the uploads table already has a moderation status column.',
        'Approve / reject actions run through an Edge Function (service_role).',
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
        'Table of active/churned subscribers fed by the RevenueCat webhook (subscriptions table already seeded).',
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
        'Referral codes and two-sided reward tracking (referrals table already seeded).',
        'Discount codes and first-print-free campaigns.',
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
        'Dynamic config table — editable without a redeploy.',
      ]}
    />
  )
}
