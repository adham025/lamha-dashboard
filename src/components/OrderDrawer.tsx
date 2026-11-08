import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, Upload } from 'lucide-react'
import Drawer from './Drawer'
import { PassportSheet } from './PassportSheet'
import type { StaffRole } from '../lib/nav'
import {
  STATUS_LABEL, STATUS_TONE, SERVICE_LABEL, isTerminal, one, shortId, customerName, explain,
  fetchOrderFull, fetchOrderEvents, fetchOrderMedia, setStatus, uploadEdited, saveInternal,
  type OrderFull, type OrderItem,
} from '../lib/orders'

const EGP = (n: number) => `${Math.round(n).toLocaleString()} EGP`
const when = (iso: string) => new Date(iso).toLocaleString('en-GB')

const inputCls =
  'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]'
const btn = 'rounded-lg px-3.5 py-2 text-sm font-semibold disabled:opacity-50'
const primary = btn + ' bg-[var(--color-accent)] text-white hover:opacity-90'
const danger = btn + ' border border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-rose-50'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{title}</h3>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1 text-sm">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

/**
 * The full order, with only the actions the signed-in role may take at the
 * order's current status. The database enforces the same rules — this just
 * keeps buttons out of sight that would be refused.
 */
export function OrderDrawer({
  orderId,
  role,
  onClose,
}: {
  orderId: string | null
  role: StaffRole
  onClose: () => void
}) {
  const qc = useQueryClient()
  const open = !!orderId
  const order = useQuery({ queryKey: ['order', orderId], queryFn: () => fetchOrderFull(orderId!), enabled: open })
  const events = useQuery({ queryKey: ['orderEvents', orderId], queryFn: () => fetchOrderEvents(orderId!), enabled: open })
  const o = order.data
  const media = useQuery({
    queryKey: ['orderMedia', orderId, o?.status, o?.print_order_items.map((i) => i.result_id).join(',')],
    queryFn: () => fetchOrderMedia(o!),
    enabled: !!o,
  })

  const [reason, setReason] = useState('')
  const [cod, setCod] = useState('')
  const [error, setError] = useState<string | null>(null)

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['order', orderId] })
    qc.invalidateQueries({ queryKey: ['orderEvents', orderId] })
    qc.invalidateQueries({ queryKey: ['orders'] })
  }
  const run = useMutation({
    mutationFn: (fn: () => Promise<void>) => fn(),
    onSuccess: () => { setError(null); setReason(''); refresh() },
    onError: (e) => setError(explain(e)),
  })

  const isAdmin = role === 'super_admin'
  const canReview = role === 'support' || isAdmin
  const canEdit = role === 'studio' || isAdmin
  const canPrint = role === 'print_ops' || isAdmin

  const lastRevision = [...(events.data ?? [])].reverse().find((e) => e.kind === 'revision_requested')
  /** After a change request, every photo needs a file uploaded *after* the request. */
  const freshAfterRevision = (it: OrderItem) => {
    if (o?.status !== 'revision_requested' || !lastRevision) return true
    const r = one(it.results)
    return !!r && new Date(r.created_at) > new Date(lastRevision.created_at)
  }
  const allEdited = !!o && o.print_order_items.every((i) => i.result_id && freshAfterRevision(i))

  const go = (status: string, note?: string, codCollected?: number) =>
    run.mutate(() => setStatus(o!.id, status, note, codCollected))

  return (
    <Drawer open={open} onClose={onClose} title={o ? `Order ${shortId(o.id)}` : 'Order'} wide>
      {!o && <p className="text-sm text-[var(--color-muted)]">Loading…</p>}
      {o && (
        <div>
          <div className="mb-5 flex items-center justify-between">
            <span className={'rounded-full px-2.5 py-1 text-xs font-semibold ' + (STATUS_TONE[o.status] ?? '')}>
              {STATUS_LABEL[o.status] ?? o.status}
            </span>
            <span className="text-xs text-[var(--color-muted)]">Placed {when(o.created_at)}</span>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-[var(--color-accent-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">{error}</div>
          )}

          <Section title="Customer">
            <Row label="Name" value={customerName(o)} />
            <Row label="Email" value={one(o.profiles)?.email ?? '—'} />
            <Row label="Phone" value={one(o.addresses)?.delivery_phone ?? '—'} />
          </Section>

          <Section title="Payment">
            <Row label="Deposit to receive" value={EGP(o.deposit_amount)} />
            <Row label="Transfer reference" value={<span className="font-mono">{o.payment_reference ?? '—'}</span>} />
            <Row label="Order code (in transfer note)" value={<span className="font-mono">{shortId(o.id)}</span>} />
            {o.payment_submitted_at && <Row label="Proof sent" value={when(o.payment_submitted_at)} />}
            {o.payment_reject_reason && <Row label="Last rejection" value={o.payment_reject_reason} />}
            {o.payment_proof_path && (
              media.data?.proof.get(o.payment_proof_path)
                ? (
                  <a href={media.data.proof.get(o.payment_proof_path)} target="_blank" rel="noreferrer">
                    <img src={media.data.proof.get(o.payment_proof_path)} alt="Payment proof" className="mt-2 max-h-80 w-full rounded-lg border border-[var(--color-border)] object-contain bg-[var(--color-bg)]" />
                  </a>
                )
                : <p className="mt-2 text-xs text-[var(--color-muted)]">Loading screenshot…</p>
            )}
            {o.status === 'payment_review' && canReview && (
              <div className="mt-3 space-y-2">
                <button className={primary + ' w-full'} disabled={run.isPending} onClick={() => go('deposit_paid')}>
                  Payment received — approve
                </button>
                <textarea
                  className={inputCls}
                  rows={2}
                  placeholder="Reason shown to the customer if you reject (e.g. amount doesn’t match)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <button className={danger + ' w-full'} disabled={run.isPending || reason.trim().length < 3} onClick={() => go('payment_rejected', reason)}>
                  Reject payment
                </button>
              </div>
            )}
          </Section>

          <Section title={`Photos (${o.print_order_items.length})`}>
            <div className="space-y-4">
              {o.print_order_items.map((it) => (
                <ItemCard
                  key={it.id}
                  order={o}
                  item={it}
                  originalUrl={media.data?.originals.get(one(it.uploads)?.storage_path ?? '')}
                  resultUrl={media.data?.results.get(one(it.results)?.storage_path ?? '')}
                  canUpload={canEdit && ['deposit_paid', 'editing', 'revision_requested'].includes(o.status)}
                  needsFresh={o.status === 'revision_requested' && !freshAfterRevision(it)}
                  onUploaded={refresh}
                  onError={(m) => setError(m)}
                />
              ))}
            </div>
          </Section>

          {(events.data ?? []).filter((e) => e.kind === 'revision_requested' && e.note).length > 0 && (
            <Section title="Customer’s change requests">
              <ul className="space-y-1.5 text-sm">
                {(events.data ?? []).filter((e) => e.kind === 'revision_requested' && e.note).map((e, i) => (
                  <li key={i} className="rounded-lg bg-orange-50 px-3 py-2">
                    {e.note} <span className="text-xs text-[var(--color-muted)]">· {when(e.created_at)}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {canEdit && <InternalSection order={o} onSaved={refresh} onError={setError} />}

          <Section title="Delivery & totals">
            {one(o.addresses) ? (
              <div className="mb-2 text-sm">
                {[one(o.addresses)!.street, one(o.addresses)!.building, one(o.addresses)!.floor_apartment].filter(Boolean).join(', ')}
                <br />
                {one(o.addresses)!.city}, {one(o.addresses)!.governorate}
                {one(o.addresses)!.landmark && <><br />Near {one(o.addresses)!.landmark}</>}
              </div>
            ) : <p className="text-sm text-[var(--color-muted)]">No address.</p>}
            <Row label="Product total" value={EGP(o.product_total)} />
            {o.discount_amount > 0 && <Row label={`Discount ${o.discount_code ?? ''}`} value={`− ${EGP(o.discount_amount)}`} />}
            <Row label="Deposit (InstaPay)" value={EGP(o.deposit_amount)} />
            <Row label="Balance to collect in cash" value={<strong>{EGP(o.balance_due)}</strong>} />
            {o.delivery_fee > 0 && <Row label="…of which delivery fee" value={EGP(o.delivery_fee)} />}
            {o.cod_collected != null && <Row label="Cash collected" value={EGP(o.cod_collected)} />}
            <Row label="Revisions requested" value={o.revision_count} />
          </Section>

          <Section title="Next step">
            <div className="space-y-2">
              {o.status === 'deposit_paid' && canEdit && (
                <button className={primary + ' w-full'} disabled={run.isPending} onClick={() => go('editing')}>
                  Photos sent to the studio — mark as editing
                </button>
              )}
              {(o.status === 'editing' || o.status === 'revision_requested') && canEdit && (
                <>
                  <button className={primary + ' w-full'} disabled={run.isPending || !allEdited} onClick={() => go('preview_ready')}>
                    Send to customer for review
                  </button>
                  {!allEdited && (
                    <p className="text-xs text-[var(--color-muted)]">
                      {o.status === 'revision_requested'
                        ? 'Upload a new edited file for every photo before sending it back.'
                        : 'Upload an edited file for every photo first.'}
                    </p>
                  )}
                </>
              )}
              {o.status === 'revision_requested' && canEdit && (
                <button className={btn + ' w-full border border-[var(--color-border)]'} disabled={run.isPending} onClick={() => go('editing')}>
                  Back to studio — mark as editing
                </button>
              )}
              {o.status === 'preview_ready' && (
                <p className="text-sm text-[var(--color-muted)]">Waiting for the customer to approve or ask for changes.</p>
              )}
              {o.status === 'approved' && canPrint && (
                <button className={primary + ' w-full'} disabled={run.isPending} onClick={() => go('in_production')}>
                  Start printing
                </button>
              )}
              {o.status === 'in_production' && canPrint && (
                <button className={primary + ' w-full'} disabled={run.isPending} onClick={() => go('shipped')}>
                  Out for delivery
                </button>
              )}
              {o.status === 'shipped' && canPrint && (
                <>
                  <label className="block text-xs text-[var(--color-muted)]">
                    Cash collected (EGP) — defaults to the balance, {EGP(o.balance_due)}
                    <input className={inputCls + ' mt-1'} type="number" value={cod} placeholder={String(Math.round(o.balance_due))} onChange={(e) => setCod(e.target.value)} />
                  </label>
                  <button className={primary + ' w-full'} disabled={run.isPending} onClick={() => go('delivered', undefined, cod === '' ? undefined : Number(cod))}>
                    Delivered
                  </button>
                  <button className={danger + ' w-full'} disabled={run.isPending} onClick={() => { if (confirm('Mark as refused by the customer?')) go('refused') }}>
                    Customer refused
                  </button>
                </>
              )}
              {!isTerminal(o.status) && canReview && (
                <button className={danger + ' w-full'} disabled={run.isPending} onClick={() => { if (confirm('Cancel this order? Remember to refund the deposit by InstaPay if one was paid.')) go('cancelled') }}>
                  Cancel order
                </button>
              )}
              {isTerminal(o.status) && <p className="text-sm text-[var(--color-muted)]">This order is closed.</p>}
            </div>
          </Section>
        </div>
      )}
    </Drawer>
  )
}

function ItemCard({
  order, item, originalUrl, resultUrl, canUpload, needsFresh, onUploaded, onError,
}: {
  order: OrderFull
  item: OrderItem
  originalUrl?: string
  resultUrl?: string
  canUpload: boolean
  needsFresh: boolean
  onUploaded: () => void
  onError: (m: string) => void
}) {
  const upload = useMutation({
    mutationFn: (file: File) => uploadEdited(order, item, file),
    onSuccess: onUploaded,
    onError: (e) => onError(explain(e)),
  })
  const result = one(item.results)

  return (
    <div className="rounded-xl border border-[var(--color-border)] p-3">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold">{SERVICE_LABEL[item.service_id ?? ''] ?? item.service_id ?? 'Photo'}</span>
        <span className="text-[var(--color-muted)]">{item.size_id} · {item.finish ?? '—'} · ×{item.quantity}</span>
      </div>
      {item.note && <p className="mb-2 rounded-lg bg-[var(--color-bg)] px-3 py-2 text-sm">“{item.note}”</p>}

      <div className="grid grid-cols-2 gap-3">
        <Figure label="Original" url={originalUrl} download={`order-${shortId(order.id)}-original`} />
        <Figure label={result ? `Edited · v${result.version}` : 'Edited'} url={resultUrl} download={`order-${shortId(order.id)}-edited-v${result?.version ?? 0}`} empty="Not uploaded yet" />
      </div>

      {canUpload && (
        <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-border)] px-3 py-2.5 text-sm font-medium text-[var(--color-accent)] hover:bg-[var(--color-bg)]">
          <Upload size={15} />
          {upload.isPending ? 'Uploading…' : result ? 'Upload a new version' : 'Upload edited photo'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={upload.isPending}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload.mutate(f); e.target.value = '' }}
          />
        </label>
      )}
      {needsFresh && <p className="mt-1.5 text-xs text-orange-600">Waiting for a new version after the customer’s request.</p>}
      {canUpload && item.service_id === 'passport' && <div className="mt-3"><PassportSheet orderCode={shortId(order.id)} /></div>}
    </div>
  )
}

function Figure({ label, url, download, empty }: { label: string; url?: string; download: string; empty?: string }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted)]">{label}</div>
      {url ? (
        <>
          <a href={url} target="_blank" rel="noreferrer">
            <img src={url} alt={label} className="aspect-[4/5] w-full rounded-lg border border-[var(--color-border)] object-cover" />
          </a>
          <a href={url} download={download} className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] hover:underline">
            <Download size={12} /> Download
          </a>
        </>
      ) : (
        <div className="flex aspect-[4/5] w-full items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] text-xs text-[var(--color-muted)]">
          {empty ?? 'Loading…'}
        </div>
      )}
    </div>
  )
}

function InternalSection({ order, onSaved, onError }: { order: OrderFull; onSaved: () => void; onError: (m: string) => void }) {
  const cur = one(order.order_internal)
  const [studio, setStudio] = useState(cur?.studio_name ?? '')
  const [cost, setCost] = useState(cur?.studio_cost != null ? String(cur.studio_cost) : '')
  const [notes, setNotes] = useState(cur?.notes ?? '')
  const save = useMutation({
    mutationFn: () => saveInternal(order.id, { studio_name: studio, studio_cost: cost, notes }),
    onSuccess: onSaved,
    onError: (e) => onError(explain(e)),
  })
  return (
    <Section title="Internal — customers never see this">
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-[var(--color-muted)]">
          Partner studio
          <input className={inputCls + ' mt-1'} value={studio} onChange={(e) => setStudio(e.target.value)} placeholder="e.g. Studio Nour" />
        </label>
        <label className="text-xs text-[var(--color-muted)]">
          Studio cost (EGP)
          <input className={inputCls + ' mt-1'} type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
        </label>
        <label className="col-span-2 text-xs text-[var(--color-muted)]">
          Notes
          <textarea className={inputCls + ' mt-1'} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
      </div>
      <button className={btn + ' mt-2 border border-[var(--color-border)]'} disabled={save.isPending} onClick={() => save.mutate()}>
        {save.isPending ? 'Saving…' : 'Save'}
      </button>
    </Section>
  )
}
