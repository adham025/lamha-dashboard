import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader, Panel } from '../components/ui'
import { DataTable, type Column } from '../components/DataTable'
import { FormDrawer, type Field, type FormValues } from '../components/FormDrawer'
import { supabase } from '../lib/supabase'
import { deleteRows, fetchConfig, insertRow, updateConfig, updateRow } from '../lib/db'
import type { ConfigRow } from '../lib/db'

type Service = {
  id: string
  active: boolean
  edit_fee: number
  turnaround_hours: number
  sort: number
  title_en: string | null
  title_ar: string | null
  blurb_en: string | null
  blurb_ar: string | null
  icon_key: string
  quantity_presets: number[] | null
  size_groups: string[]
}

type Size = {
  id: string
  grp: string
  label: string
  detail: string
  price: number
  active: boolean
  sort: number
  quantity_presets: number[] | null
}

type Finish = {
  id: string
  label_en: string
  label_ar: string
  sort: number
  active: boolean
}

const GROUPS = ['document', 'print', 'framed', 'graduation'].map((g) => ({ value: g, label: g }))
const ICON_OPTS = [
  'photoRestore', 'badge', 'sparkle', 'smiley', 'briefcase', 'heart', 'palette', 'graduateCap', 'house',
  'camera', 'grid', 'gift',
].map((v) => ({ value: v, label: v }))

const parsePresetCsv = (raw: string) =>
  String(raw ?? '')
    .split(/[,;\s]+/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)

const presetCsv = (arr: number[] | null | undefined) => (arr?.length ? arr.join(', ') : '')

const fetchServices = async () => {
  const { data, error } = await supabase.from('services').select('*').order('sort')
  if (error) throw error
  return (data ?? []) as Service[]
}
const fetchSizes = async () => {
  const { data, error } = await supabase.from('print_sizes').select('*').order('grp').order('sort')
  if (error) throw error
  return (data ?? []) as Size[]
}
const fetchFinishes = async () => {
  const { data, error } = await supabase.from('print_finishes').select('*').order('sort')
  if (error) throw error
  return (data ?? []) as Finish[]
}

const on = (b: boolean) => (
  <span className={'font-medium ' + (b ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]')}>{b ? 'On' : 'Off'}</span>
)

/** Services, sizes, finishes, and in-app copy — Zad-style grouped catalogue. */
export default function Catalogue() {
  const qc = useQueryClient()
  const services = useQuery({ queryKey: ['services'], queryFn: fetchServices })
  const sizes = useQuery({ queryKey: ['sizes'], queryFn: fetchSizes })
  const finishes = useQuery({ queryKey: ['finishes'], queryFn: fetchFinishes })
  const config = useQuery({ queryKey: ['config'], queryFn: fetchConfig })

  const [svcMode, setSvcMode] = useState<'add' | 'edit' | null>(null)
  const [editSvc, setEditSvc] = useState<Service | null>(null)
  const [sizeMode, setSizeMode] = useState<'add' | 'edit' | null>(null)
  const [editSize, setEditSize] = useState<Size | null>(null)
  const [finishMode, setFinishMode] = useState<'add' | 'edit' | null>(null)
  const [editFinish, setEditFinish] = useState<Finish | null>(null)
  const [error, setError] = useState<string | null>(null)

  const closeSvc = () => { setSvcMode(null); setEditSvc(null); setError(null) }
  const closeSize = () => { setSizeMode(null); setEditSize(null); setError(null) }
  const closeFinish = () => { setFinishMode(null); setEditFinish(null); setError(null) }

  const saveSvc = useMutation({
    mutationFn: (v: FormValues) => {
      const body = {
        active: v.active,
        edit_fee: Number(v.edit_fee) || 0,
        turnaround_hours: Math.max(1, Number(v.turnaround_hours) || 48),
        sort: Number(v.sort) || 0,
        title_en: String(v.title_en ?? '').trim(),
        title_ar: String(v.title_ar ?? '').trim(),
        blurb_en: String(v.blurb_en ?? '').trim(),
        blurb_ar: String(v.blurb_ar ?? '').trim(),
        icon_key: String(v.icon_key ?? 'sparkle').trim(),
        quantity_presets: (() => {
          const p = parsePresetCsv(String(v.quantity_presets ?? ''))
          return p.length ? p : null
        })(),
        size_groups: String(v.size_groups ?? 'print')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      }
      if (svcMode === 'add') {
        const id = String(v.id).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
        if (!id) throw new Error('Enter a short id (letters and numbers), e.g. portrait')
        return insertRow('services', { id, ...body })
      }
      return updateRow('services', editSvc!.id, body)
    },
    onSuccess: () => { closeSvc(); qc.invalidateQueries({ queryKey: ['services'] }) },
    onError: (e: unknown) => setError(e instanceof Error ? e.message : 'Failed to save service'),
  })

  const delSvc = useMutation({
    mutationFn: (ids: string[]) => deleteRows('services', ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
    onError: (e: unknown) => alert((e as { message?: string })?.message ?? 'Could not delete — turn it off instead if orders use it.'),
  })

  const saveSize = useMutation({
    mutationFn: (v: FormValues) => {
      const body = {
        grp: v.grp,
        label: String(v.label).trim(),
        detail: String(v.detail ?? '').trim(),
        price: Number(v.price) || 0,
        sort: Number(v.sort) || 0,
        active: v.active,
        quantity_presets: (() => {
          const p = parsePresetCsv(String(v.quantity_presets ?? ''))
          return p.length ? p : null
        })(),
      }
      if (sizeMode === 'add') {
        const id = String(v.id).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
        if (!id) throw new Error('Enter a short id (letters and numbers), e.g. p4')
        return insertRow('print_sizes', { id, ...body })
      }
      return updateRow('print_sizes', editSize!.id, body)
    },
    onSuccess: () => { closeSize(); qc.invalidateQueries({ queryKey: ['sizes'] }) },
    onError: (e: unknown) => setError(e instanceof Error ? e.message : (e as { message?: string })?.message ?? 'Failed'),
  })
  const delSize = useMutation({
    mutationFn: (ids: string[]) => deleteRows('print_sizes', ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sizes'] }),
    onError: (e: unknown) => alert((e as { message?: string })?.message ?? 'Could not delete — switch it off instead if it is used by orders.'),
  })

  const saveFinish = useMutation({
    mutationFn: (v: FormValues) => {
      const body = {
        label_en: String(v.label_en).trim(),
        label_ar: String(v.label_ar).trim(),
        sort: Number(v.sort) || 0,
        active: v.active,
      }
      if (finishMode === 'add') {
        const id = String(v.id).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
        if (!id) throw new Error('Enter a short id, e.g. satin')
        return insertRow('print_finishes', { id, ...body })
      }
      return updateRow('print_finishes', editFinish!.id, body)
    },
    onSuccess: () => { closeFinish(); qc.invalidateQueries({ queryKey: ['finishes'] }) },
    onError: (e: unknown) => setError(e instanceof Error ? e.message : 'Failed to save finish'),
  })
  const delFinish = useMutation({
    mutationFn: (ids: string[]) => deleteRows('print_finishes', ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finishes'] }),
  })

  const copyRows = (config.data ?? []).filter((r) => r.grp === 'App copy')
  const saveCopy = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => updateConfig(key, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['config'] }),
  })

  const svcCols: Column<Service>[] = [
    { header: 'Service', render: (s) => <span className="font-medium">{s.title_en || s.id}</span> },
    { header: 'Order', render: (s) => <span className="tabular-nums text-[var(--color-muted)]">{s.sort}</span> },
    { header: 'Shown in app', render: (s) => on(s.active) },
    { header: 'Qty presets', render: (s) => <span className="text-[var(--color-muted)]">{presetCsv(s.quantity_presets) || '1–20 stepper'}</span> },
    { header: 'Extra edit fee', render: (s) => <span className="tabular-nums">{s.edit_fee} EGP</span> },
    { header: 'Turnaround', render: (s) => <span className="text-[var(--color-muted)]">{s.turnaround_hours} h</span> },
  ]
  const sizeCols: Column<Size>[] = [
    { header: 'Size', render: (s) => <span className="font-medium">{s.label}</span> },
    { header: 'Group', render: (s) => <span className="capitalize text-[var(--color-muted)]">{s.grp}</span> },
    { header: 'Detail', render: (s) => <span className="text-[var(--color-muted)]">{s.detail || '—'}</span> },
    { header: 'Price', render: (s) => <span className="font-semibold tabular-nums">{s.price} EGP</span> },
    { header: 'Qty presets', render: (s) => <span className="text-[var(--color-muted)]">{presetCsv(s.quantity_presets) || '—'}</span> },
    { header: 'Shown in app', render: (s) => on(s.active) },
  ]
  const finishCols: Column<Finish>[] = [
    { header: 'Id', render: (f) => <span className="font-mono text-sm">{f.id}</span> },
    { header: 'English', render: (f) => <span className="font-medium">{f.label_en}</span> },
    { header: 'Arabic', render: (f) => <span className="font-medium">{f.label_ar}</span> },
    { header: 'Shown in app', render: (f) => on(f.active) },
  ]

  const SVC_FIELDS: Field[] = [
    ...(svcMode === 'add' ? [{ name: 'id', label: 'Short id', required: true, placeholder: 'e.g. portrait' } as Field] : []),
    { name: 'title_en', label: 'Title (English)', required: true, colSpan: 2 },
    { name: 'title_ar', label: 'Title (Arabic)', required: true, colSpan: 2 },
    { name: 'blurb_en', label: 'Description (English)', colSpan: 2, placeholder: 'Shown on the studio card' },
    { name: 'blurb_ar', label: 'Description (Arabic)', colSpan: 2 },
    { name: 'icon_key', label: 'Icon', type: 'select', required: true, options: ICON_OPTS },
    { name: 'size_groups', label: 'Size groups (comma-separated)', required: true, placeholder: 'print, framed' },
    { name: 'quantity_presets', label: 'Quantity options', placeholder: 'e.g. 6, 8, 10 — leave empty for 1–20 stepper' },
    { name: 'edit_fee', label: 'Extra edit fee (EGP)', type: 'number', placeholder: '0 = print price only' },
    { name: 'turnaround_hours', label: 'Turnaround (hours)', type: 'number', required: true },
    { name: 'sort', label: 'Order in studio grid', type: 'number' },
    { name: 'active', label: 'Shown in the app', type: 'switch' },
  ]

  const SIZE_FIELDS: Field[] = [
    ...(sizeMode === 'add' ? [{ name: 'id', label: 'Short id', required: true, placeholder: 'e.g. p4' } as Field] : []),
    { name: 'grp', label: 'Group', type: 'select', required: true, options: GROUPS },
    { name: 'label', label: 'Name', required: true, colSpan: 2, placeholder: 'e.g. 10×15cm' },
    { name: 'detail', label: 'Detail', colSpan: 2, placeholder: 'e.g. 4×6″' },
    { name: 'price', label: 'Price (EGP)', type: 'number', required: true },
    { name: 'quantity_presets', label: 'Quantity options (optional)', placeholder: 'Overrides service presets for this size only' },
    { name: 'sort', label: 'Order in list', type: 'number' },
    { name: 'active', label: 'Shown in the app', type: 'switch' },
  ]

  const FINISH_FIELDS: Field[] = [
    ...(finishMode === 'add' ? [{ name: 'id', label: 'Short id', required: true, placeholder: 'e.g. satin' } as Field] : []),
    { name: 'label_en', label: 'Label (English)', required: true },
    { name: 'label_ar', label: 'Label (Arabic)', required: true },
    { name: 'sort', label: 'Order', type: 'number' },
    { name: 'active', label: 'Shown in the app', type: 'switch' },
  ]

  return (
    <div className="space-y-10">
      <div>
        <PageHeader
          title="Studio services"
          subtitle="Cards on the Studio tab — titles, descriptions, icons, and which print sizes appear. Turn a service off to hide it."
        />
        <DataTable
          rows={services.data ?? []}
          getId={(s) => s.id}
          columns={svcCols}
          loading={services.isLoading}
          addLabel="New service"
          onAdd={() => { setError(null); setSvcMode('add') }}
          onEdit={(s) => { setError(null); setEditSvc(s); setSvcMode('edit') }}
          onDelete={(ids) => delSvc.mutate(ids)}
          emptyText="No services."
        />
      </div>

      <div>
        <PageHeader title="Print sizes" subtitle="What customers pick on the configure screen — label, price, and optional quantity presets per size." />
        <DataTable
          rows={sizes.data ?? []}
          getId={(s) => s.id}
          columns={sizeCols}
          loading={sizes.isLoading}
          addLabel="New size"
          onAdd={() => { setError(null); setSizeMode('add') }}
          onEdit={(s) => { setError(null); setEditSize(s); setSizeMode('edit') }}
          onDelete={(ids) => delSize.mutate(ids)}
          emptyText="No sizes."
        />
      </div>

      <div>
        <PageHeader
          title="Print finish"
          subtitle="Glossy / matte (paper coating) on the configure screen — add or rename options here."
        />
        <DataTable
          rows={finishes.data ?? []}
          getId={(f) => f.id}
          columns={finishCols}
          loading={finishes.isLoading}
          addLabel="New finish"
          onAdd={() => { setError(null); setFinishMode('add') }}
          onEdit={(f) => { setError(null); setEditFinish(f); setFinishMode('edit') }}
          onDelete={(ids) => delFinish.mutate(ids)}
          emptyText="No finish options."
        />
      </div>

      <div>
        <PageHeader title="In-app copy" subtitle="Studio subtitle and configure-screen messages — English and Arabic. Also listed under Settings → App copy." />
        <Panel className="divide-y divide-[var(--color-border)] p-5">
          {copyRows.length === 0 && <p className="text-sm text-[var(--color-muted)]">Run migration 0019 or add rows in Settings.</p>}
          {copyRows.map((row) => (
            <CopyField key={row.key} row={row} onSave={(key, value) => saveCopy.mutate({ key, value })} />
          ))}
        </Panel>
      </div>

      <FormDrawer
        open={svcMode !== null}
        onClose={closeSvc}
        title={svcMode === 'add' ? 'New studio service' : `Edit — ${editSvc?.title_en ?? editSvc?.id ?? ''}`}
        fields={SVC_FIELDS}
        initial={
          svcMode === 'edit' && editSvc
            ? {
                active: editSvc.active,
                title_en: editSvc.title_en ?? '',
                title_ar: editSvc.title_ar ?? '',
                blurb_en: editSvc.blurb_en ?? '',
                blurb_ar: editSvc.blurb_ar ?? '',
                icon_key: editSvc.icon_key ?? 'sparkle',
                size_groups: (editSvc.size_groups ?? ['print']).join(', '),
                quantity_presets: presetCsv(editSvc.quantity_presets),
                edit_fee: String(editSvc.edit_fee),
                turnaround_hours: String(editSvc.turnaround_hours),
                sort: String(editSvc.sort),
              }
            : svcMode === 'add'
              ? { active: true, icon_key: 'sparkle', size_groups: 'print, framed', turnaround_hours: '48' }
              : undefined
        }
        submitLabel={svcMode === 'add' ? 'Create' : 'Save'}
        busy={saveSvc.isPending}
        error={error}
        onSubmit={(v) => { setError(null); saveSvc.mutate(v) }}
      />
      <FormDrawer
        open={sizeMode !== null}
        onClose={closeSize}
        title={sizeMode === 'add' ? 'New print size' : 'Edit print size'}
        fields={SIZE_FIELDS}
        initial={
          sizeMode === 'edit' && editSize
            ? {
                grp: editSize.grp,
                label: editSize.label,
                detail: editSize.detail,
                price: String(editSize.price),
                quantity_presets: presetCsv(editSize.quantity_presets),
                sort: String(editSize.sort),
                active: editSize.active,
              }
            : sizeMode === 'add'
              ? { active: true }
              : undefined
        }
        submitLabel={sizeMode === 'add' ? 'Create' : 'Save'}
        busy={saveSize.isPending}
        error={error}
        onSubmit={(v) => { setError(null); saveSize.mutate(v) }}
      />
      <FormDrawer
        open={finishMode !== null}
        onClose={closeFinish}
        title={finishMode === 'add' ? 'New finish' : `Edit finish — ${editFinish?.label_en ?? ''}`}
        fields={FINISH_FIELDS}
        initial={
          finishMode === 'edit' && editFinish
            ? {
                label_en: editFinish.label_en,
                label_ar: editFinish.label_ar,
                sort: String(editFinish.sort),
                active: editFinish.active,
              }
            : finishMode === 'add'
              ? { active: true }
              : undefined
        }
        submitLabel={finishMode === 'add' ? 'Create' : 'Save'}
        busy={saveFinish.isPending}
        error={error}
        onSubmit={(v) => { setError(null); saveFinish.mutate(v) }}
      />
    </div>
  )
}

function CopyField({ row, onSave }: { row: ConfigRow; onSave: (key: string, value: string) => void }) {
  const [v, setV] = useState(row.value)
  useEffect(() => setV(row.value), [row.value])
  return (
    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="text-sm font-medium">{row.label}</div>
        <div className="text-xs text-[var(--color-muted)]">{row.key}</div>
      </div>
      <textarea
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => v !== row.value && onSave(row.key, v)}
        rows={2}
        className="min-h-[60px] w-full max-w-xl rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
      />
    </div>
  )
}