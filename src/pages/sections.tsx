import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader, Panel, TableShell, RowDelete, thClass } from '../components/ui'
import {
  fetchUploads, fetchSubscriptions, fetchReferrals,
  deleteRows, updateRow,
} from '../lib/db'

const modColor: Record<string, string> = {
  approved: 'text-[var(--color-success)]',
  flagged: 'text-[var(--color-warn)]',
  rejected: 'text-[var(--color-danger)]',
  pending: 'text-[var(--color-muted)]',
}

export function Moderation() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['uploads'], queryFn: fetchUploads })
  const setMod = useMutation({
    mutationFn: ({ id, moderation }: { id: string; moderation: string }) =>
      updateRow('uploads', id, { moderation }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['uploads'] }),
  })
  const del = useMutation({
    mutationFn: (id: string) => deleteRows('uploads', [id]),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['uploads'] }),
  })

  const rows = (data ?? []).slice().sort((a, b) => {
    const rank = (m: string) => (m === 'flagged' ? 0 : m === 'pending' ? 1 : 2)
    return rank(a.moderation) - rank(b.moderation)
  })

  return (
    <div>
      <PageHeader title="Moderation" subtitle="Review flagged uploads before any print ships." />
      <TableShell>
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className={thClass}>Upload</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Uploaded</th>
            <th className={thClass}>Review</th>
            <th className={thClass}></th>
          </tr>
        </thead>
        <tbody>
          {isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--color-muted)]">Loading…</td></tr>}
          {rows.map((u) => (
            <tr key={u.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]">
              <td className="px-4 py-3 font-mono text-xs">{u.storage_path}</td>
              <td className={'px-4 py-3 text-sm font-semibold capitalize ' + (modColor[u.moderation] ?? '')}>{u.moderation}</td>
              <td className="px-4 py-3 text-[var(--color-muted)]">{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button onClick={() => setMod.mutate({ id: u.id, moderation: 'approved' })}
                    className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium hover:bg-[var(--color-bg)]">Approve</button>
                  <button onClick={() => setMod.mutate({ id: u.id, moderation: 'rejected' })}
                    className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-danger)] hover:bg-[var(--color-bg)]">Reject</button>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <RowDelete onClick={() => { if (confirm('Delete this upload?')) del.mutate(u.id) }} />
              </td>
            </tr>
          ))}
          {!isLoading && rows.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--color-muted)]">Nothing to review.</td></tr>}
        </tbody>
      </TableShell>
    </div>
  )
}

export function Subscriptions() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['subs'], queryFn: fetchSubscriptions })
  const del = useMutation({
    mutationFn: (id: string) => deleteRows('subscriptions', [id]),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subs'] }),
  })

  return (
    <div>
      <PageHeader title="Subscriptions" subtitle="Active and churned subscribers." />
      <TableShell>
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className={thClass}>Subscriber</th>
            <th className={thClass}>Tier</th>
            <th className={thClass}>State</th>
            <th className={thClass}>Renews</th>
            <th className={thClass}></th>
          </tr>
        </thead>
        <tbody>
          {isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--color-muted)]">Loading…</td></tr>}
          {(data ?? []).map((s) => (
            <tr key={s.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]">
              <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted)]">{s.profile_id.slice(0, 8)}</td>
              <td className="px-4 py-3 font-semibold uppercase">{s.tier}</td>
              <td className="px-4 py-3">
                <span className={'text-sm font-medium ' + (s.active ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]')}>
                  {s.active ? 'Active' : 'Churned'}
                </span>
              </td>
              <td className="px-4 py-3 text-[var(--color-muted)]">{s.renews_at ? new Date(s.renews_at).toLocaleDateString('en-GB') : '—'}</td>
              <td className="px-4 py-3 text-right">
                <RowDelete onClick={() => { if (confirm('Delete this subscription?')) del.mutate(s.id) }} />
              </td>
            </tr>
          ))}
          {!isLoading && (data ?? []).length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--color-muted)]">No subscribers yet.</td></tr>}
        </tbody>
      </TableShell>
    </div>
  )
}

export function Promotions() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['referrals'], queryFn: fetchReferrals })
  const del = useMutation({
    mutationFn: (id: string) => deleteRows('referrals', [id]),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['referrals'] }),
  })

  return (
    <div>
      <PageHeader title="Promotions" subtitle="Referral codes and their reward state." />
      <TableShell>
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className={thClass}>Code</th>
            <th className={thClass}>Rewarded</th>
            <th className={thClass}>Created</th>
            <th className={thClass}></th>
          </tr>
        </thead>
        <tbody>
          {isLoading && <tr><td colSpan={4} className="px-4 py-6 text-center text-[var(--color-muted)]">Loading…</td></tr>}
          {(data ?? []).map((r) => (
            <tr key={r.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]">
              <td className="px-4 py-3 font-mono text-sm">{r.code}</td>
              <td className="px-4 py-3">
                <span className={'text-sm font-medium ' + (r.rewarded ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]')}>
                  {r.rewarded ? 'Yes' : 'Pending'}
                </span>
              </td>
              <td className="px-4 py-3 text-[var(--color-muted)]">{new Date(r.created_at).toLocaleDateString('en-GB')}</td>
              <td className="px-4 py-3 text-right">
                <RowDelete onClick={() => { if (confirm('Delete this referral code?')) del.mutate(r.id) }} />
              </td>
            </tr>
          ))}
          {!isLoading && (data ?? []).length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-[var(--color-muted)]">No referral codes yet.</td></tr>}
        </tbody>
      </TableShell>
    </div>
  )
}

export function Settings() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Project configuration." />
      <div className="grid gap-4 md:grid-cols-2">
        <Panel className="p-5">
          <div className="text-sm font-semibold">Free tier</div>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--color-muted)]">Lifetime trial credits</dt><dd className="font-medium tabular-nums">2</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--color-muted)]">Ad content rating</dt><dd className="font-medium">PG / Teen</dd></div>
          </dl>
        </Panel>
        <Panel className="p-5">
          <div className="text-sm font-semibold">Subscription tiers</div>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--color-muted)]">Plus</dt><dd className="font-medium">EGP 69/mo · 30 credits</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--color-muted)]">Pro</dt><dd className="font-medium">EGP 149/mo · 60 credits</dd></div>
          </dl>
        </Panel>
        <Panel className="p-5">
          <div className="text-sm font-semibold">Print & delivery</div>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--color-muted)]">Deposit</dt><dd className="font-medium">50% online + COD</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--color-muted)]">Standard delivery</dt><dd className="font-medium">EGP 35–60</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--color-muted)]">Express delivery</dt><dd className="font-medium">EGP 80–120</dd></div>
          </dl>
        </Panel>
        <Panel className="p-5">
          <div className="text-sm font-semibold">Support</div>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--color-muted)]">WhatsApp</dt><dd className="font-medium">+20 106 027 0197</dd></div>
          </dl>
        </Panel>
      </div>
      <p className="mt-4 text-xs text-[var(--color-muted)]">
        These values will become editable once the config table is wired.
      </p>
    </div>
  )
}
