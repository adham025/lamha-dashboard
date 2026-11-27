import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { PageHeader, Panel } from '../components/ui'
import { fetchCmsPages, fetchFaqItems, updateCmsPage, updateFaqItem, type CmsPageRow, type FaqRow } from '../lib/db'

export default function SiteContent() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['cms-pages'], queryFn: fetchCmsPages })
  const [edit, setEdit] = useState<CmsPageRow | null>(null)
  const [editFaq, setEditFaq] = useState<FaqRow | null>(null)
  const faq = useQuery({ queryKey: ['faq-items'], queryFn: fetchFaqItems })

  const save = useMutation({
    mutationFn: (row: CmsPageRow) =>
      updateCmsPage(row.slug, {
        title_en: row.title_en,
        title_ar: row.title_ar,
        body_en: row.body_en,
        body_ar: row.body_ar,
        effective_date: row.effective_date,
      }),
    onSuccess: () => {
      setEdit(null)
      void qc.invalidateQueries({ queryKey: ['cms-pages'] })
    },
  })

  const saveFaq = useMutation({
    mutationFn: (row: FaqRow) =>
      updateFaqItem(row.id, {
        question_en: row.question_en,
        question_ar: row.question_ar,
        answer_en: row.answer_en,
        answer_ar: row.answer_ar,
        sort: row.sort,
        active: row.active,
      }),
    onSuccess: () => {
      setEditFaq(null)
      void qc.invalidateQueries({ queryKey: ['faq-items'] })
    },
  })

  const legal = (data ?? []).filter((p) => p.grp === 'legal')
  const site = (data ?? []).filter((p) => p.grp === 'site')

  return (
    <div>
      <PageHeader
        title="Legal & site"
        subtitle="Privacy, terms, refunds, about, and contact — same pages as the public site and the app legal links."
      />
      {isLoading && <Panel className="p-5 text-sm text-[var(--color-muted)]">Loading…</Panel>}
      <div className="grid gap-6 lg:grid-cols-3">
        <PageList title="Legal" rows={legal} onEdit={setEdit} />
        <PageList title="Site pages" rows={site} onEdit={setEdit} />
        <FaqList title="Home FAQ" rows={faq.data ?? []} loading={faq.isLoading} onEdit={setEditFaq} />
      </div>

      {edit && (
        <EditDrawer
          row={edit}
          busy={save.isPending}
          onClose={() => setEdit(null)}
          onSave={(row: CmsPageRow) => save.mutate(row)}
        />
      )}
      {editFaq && (
        <FaqDrawer
          row={editFaq}
          busy={saveFaq.isPending}
          onClose={() => setEditFaq(null)}
          onSave={(row) => saveFaq.mutate(row)}
        />
      )}
    </div>
  )
}

function FaqList({
  title,
  rows,
  loading,
  onEdit,
}: {
  title: string
  rows: FaqRow[]
  loading: boolean
  onEdit: (r: FaqRow) => void
}) {
  return (
    <Panel className="divide-y divide-[var(--color-border)] p-0">
      <div className="px-5 py-4 text-sm font-semibold">{title}</div>
      {loading && <p className="px-5 py-4 text-sm text-[var(--color-muted)]">Loading…</p>}
      {rows.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onEdit(r)}
          className="flex w-full flex-col items-start gap-1 px-5 py-3 text-left text-sm hover:bg-[var(--color-bg)]"
        >
          <span className="font-medium line-clamp-2">{r.question_en}</span>
          <span className="text-xs text-[var(--color-muted)]">#{r.sort}</span>
        </button>
      ))}
    </Panel>
  )
}

function FaqDrawer({
  row,
  busy,
  onClose,
  onSave,
}: {
  row: FaqRow
  busy: boolean
  onClose: () => void
  onSave: (r: FaqRow) => void
}) {
  const [draft, setDraft] = useState(row)
  const area =
    'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]'
  const set = (patch: Partial<FaqRow>) => setDraft({ ...draft, ...patch })

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="flex h-full w-full max-w-xl flex-col bg-[var(--color-panel)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div className="font-semibold">FAQ — {row.id}</div>
          <button type="button" className="text-sm text-[var(--color-muted)]" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          <Field label="Question (EN)">
            <input className={area} value={draft.question_en} onChange={(e) => set({ question_en: e.target.value })} />
          </Field>
          <Field label="Question (AR)">
            <input dir="rtl" className={area} value={draft.question_ar} onChange={(e) => set({ question_ar: e.target.value })} />
          </Field>
          <Field label="Answer (EN)">
            <textarea rows={5} className={area + ' resize-y'} value={draft.answer_en} onChange={(e) => set({ answer_en: e.target.value })} />
          </Field>
          <Field label="Answer (AR)">
            <textarea dir="rtl" rows={5} className={area + ' resize-y'} value={draft.answer_ar} onChange={(e) => set({ answer_ar: e.target.value })} />
          </Field>
          <Field label="Sort order">
            <input type="number" className={area} value={draft.sort} onChange={(e) => set({ sort: Number(e.target.value) })} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.active} onChange={(e) => set({ active: e.target.checked })} />
            Active on home page
          </label>
        </div>
        <EditFooter busy={busy} onSave={() => onSave(draft)} />
      </div>
    </div>
  )
}

function PageList({
  title,
  rows,
  onEdit,
}: {
  title: string
  rows: CmsPageRow[]
  onEdit: (r: CmsPageRow) => void
}) {
  return (
    <Panel className="divide-y divide-[var(--color-border)] p-0">
      <div className="px-5 py-4 text-sm font-semibold">{title}</div>
      {rows.map((r) => (
        <button
          key={r.slug}
          type="button"
          onClick={() => onEdit(r)}
          className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm hover:bg-[var(--color-bg)]"
        >
          <span className="font-medium">{r.title_en}</span>
          <span className="text-xs text-[var(--color-muted)]">
            {r.grp === 'legal' ? `/legal/${r.slug}` : `/${r.slug}`}
          </span>
        </button>
      ))}
      {rows.length === 0 && <p className="px-5 py-4 text-sm text-[var(--color-muted)]">No pages.</p>}
    </Panel>
  )
}

function EditDrawer({
  row,
  busy,
  onClose,
  onSave,
}: {
  row: CmsPageRow
  busy: boolean
  onClose: () => void
  onSave: (r: CmsPageRow) => void
}) {
  const [draft, setDraft] = useState(row)
  const isLegal = row.grp === 'legal'
  const path = row.grp === 'legal' ? `/legal/${row.slug}` : `/${row.slug}`

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="flex h-full w-full max-w-xl flex-col bg-[var(--color-panel)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <div className="font-semibold">Edit — {row.slug}</div>
            <div className="text-xs text-[var(--color-muted)]">{path}</div>
          </div>
          <button type="button" className="text-sm text-[var(--color-muted)]" onClick={onClose}>
            Close
          </button>
        </div>
        <EditFields draft={draft} isLegal={isLegal} setDraft={setDraft} />
        <EditFooter busy={busy} onSave={() => onSave(draft)} />
      </div>
    </div>
  )
}

function EditFields({
  draft,
  isLegal,
  setDraft,
}: {
  draft: CmsPageRow
  isLegal: boolean
  setDraft: (r: CmsPageRow) => void
}) {
  const set = (patch: Partial<CmsPageRow>) => setDraft({ ...draft, ...patch })
  const area =
    'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]'

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
      <Field label="Title (English)">
        <input className={area} value={draft.title_en} onChange={(e) => set({ title_en: e.target.value })} />
      </Field>
      <Field label="Title (Arabic)">
        <input dir="rtl" className={area} value={draft.title_ar} onChange={(e) => set({ title_ar: e.target.value })} />
      </Field>
      {isLegal && (
        <Field label="Effective date">
          <input
            className={area}
            value={draft.effective_date ?? ''}
            onChange={(e) => set({ effective_date: e.target.value || null })}
          />
        </Field>
      )}
      <Field label="Body (English) — Markdown">
        <textarea
          rows={12}
          className={area + ' resize-y font-mono text-xs'}
          value={draft.body_en}
          onChange={(e) => set({ body_en: e.target.value })}
        />
      </Field>
      <Field label="Body (Arabic) — Markdown">
        <textarea
          dir="rtl"
          rows={12}
          className={area + ' resize-y font-mono text-xs'}
          value={draft.body_ar}
          onChange={(e) => set({ body_ar: e.target.value })}
        />
      </Field>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-[var(--color-muted)]">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function EditFooter({ busy, onSave }: { busy: boolean; onSave: () => void }) {
  return (
    <div className="border-t border-[var(--color-border)] px-5 py-4">
      <button
        type="button"
        disabled={busy}
        onClick={onSave}
        className="w-full rounded-xl bg-[var(--color-accent)] py-2.5 text-sm font-bold text-white disabled:opacity-50"
      >
        {busy ? 'Saving…' : 'Save'}
      </button>
    </div>
  )
}