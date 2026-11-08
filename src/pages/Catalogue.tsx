import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '../components/ui'
import { DataTable, type Column } from '../components/DataTable'
import { FormDrawer, type Field, type FormValues } from '../components/FormDrawer'
import { supabase } from '../lib/supabase'
import { deleteRows, insertRow, updateRow } from '../lib/db'
import { SERVICE_LABEL } from '../lib/orders'

type Service = { id: string; active: boolean; edit_fee: number; turnaround_hours: number; sort: number }
type Size = { id: string; grp: string; label: string; detail: string; price: number; active: boolean; sort: number }

const GROUPS = ['document', 'print', 'framed', 'graduation'].map((g) => ({ value: g, label: g }))

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

const on = (b: boolean) => (
  <span className={'font-medium ' + (b ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]')}>{b ? 'On' : 'Off'}</span>
)

/** Services and print sizes — everything the app lists, priced here. */
export default function Catalogue() {
  const qc = useQueryClient()
  const services = useQuery({ queryKey: ['services'], queryFn: fetchServices })
  const sizes = useQuery({ queryKey: ['sizes'], queryFn: fetchSizes })
  const [editSvc, setEditSvc] = useState<Service | null>(null)
  const [sizeMode, setSizeMode] = useState<'add' | 'edit' | null>(null)
  const [editSize, setEditSize] = useState<Size | null>(null)
  const [error, setError] = useState<string | null>(null)
  const closeSize = () => { setSizeMode(null); setEditSize(null); setError(null) }

  const saveSvc = useMutation({
    mutationFn: (v: FormValues) =>
      updateRow('services', editSvc!.id, {
        active: v.active,
        edit_fee: Number(v.edit_fee) || 0,
        turnaround_hours: Math.max(1, Number(v.turnaround_hours) || 48),
      }),
    onSuccess: () => { setEditSvc(null); qc.invalidateQueries({ queryKey: ['services'] }) },
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
    onError: (e: unknown) => alert((e as { message?: string })?.message ?? 'Couldn’t delete — switch it off instead if it is used by orders.'),
  })

  const svcCols: Column<Service>[] = [
    { header: 'Service', render: (s) => <span className="font-medium">{SERVICE_LABEL[s.id] ?? s.id}</span> },
    { header: 'Shown in app', render: (s) => on(s.active) },
    { header: 'Extra edit fee (EGP)', render: (s) => <span className="tabular-nums">{s.edit_fee}</span> },
    { header: 'Turnaround', render: (s) => <span className="text-[var(--color-muted)]">{s.turnaround_hours} h</span> },
  ]
  const sizeCols: Column<Size>[] = [
    { header: 'Size', render: (s) => <span className="font-medium">{s.label}</span> },
    { header: 'Group', render: (s) => <span className="capitalize text-[var(--color-muted)]">{s.grp}</span> },
    { header: 'Detail', render: (s) => <span className="text-[var(--color-muted)]">{s.detail || '—'}</span> },
    { header: 'Price (EGP)', render: (s) => <span className="font-semibold tabular-nums">{s.price}</span> },
    { header: 'Shown in app', render: (s) => on(s.active) },
  ]

  const SVC_FIELDS: Field[] = [
    { name: 'active', label: 'Shown in the app', type: 'switch' },
    { name: 'edit_fee', label: 'Extra edit fee (EGP)', type: 'number', placeholder: '0 = the print price only' },
    { name: 'turnaround_hours', label: 'Turnaround (hours)', type: 'number', required: true },
  ]
  const SIZE_FIELDS: Field[] = [
    ...(sizeMode === 'add' ? [{ name: 'id', label: 'Short id', required: true, placeholder: 'e.g. p4' } as Field] : []),
    { name: 'grp', label: 'Group', type: 'select', required: true, options: GROUPS },
    { name: 'label', label: 'Name', required: true, colSpan: 2, placeholder: 'e.g. 10×15cm' },
    { name: 'detail', label: 'Detail', colSpan: 2, placeholder: 'e.g. 4×6″' },
    { name: 'price', label: 'Price (EGP)', type: 'number', required: true },
    { name: 'sort', label: 'Order in list', type: 'number' },
    { name: 'active', label: 'Shown in the app', type: 'switch' },
  ]

  return (
    <div className="space-y-10">
      <div>
        <PageHeader title="Services" subtitle="Turn a service off, add an edit fee on top of the print price, and set the turnaround shown to customers." />
        <DataTable
          rows={services.data ?? []}
          getId={(s) => s.id}
          columns={svcCols}
          loading={services.isLoading}
          onEdit={setEditSvc}
          emptyText="No services."
        />
      </div>

      <div>
        <PageHeader title="Print sizes" subtitle="What customers pick from — and what each costs. The price you set here is the one used at checkout." />
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

      <FormDrawer
        open={!!editSvc}
        onClose={() => setEditSvc(null)}
        title={editSvc ? SERVICE_LABEL[editSvc.id] ?? editSvc.id : 'Service'}
        fields={SVC_FIELDS}
        initial={editSvc ? { active: editSvc.active, edit_fee: String(editSvc.edit_fee), turnaround_hours: String(editSvc.turnaround_hours) } : undefined}
        busy={saveSvc.isPending}
        onSubmit={(v) => saveSvc.mutate(v)}
      />
      <FormDrawer
        open={sizeMode !== null}
        onClose={closeSize}
        title={sizeMode === 'add' ? 'New print size' : 'Edit print size'}
        fields={SIZE_FIELDS}
        initial={
          sizeMode === 'edit' && editSize
            ? { grp: editSize.grp, label: editSize.label, detail: editSize.detail, price: String(editSize.price), sort: String(editSize.sort), active: editSize.active }
            : sizeMode === 'add' ? { active: true } : undefined
        }
        submitLabel={sizeMode === 'add' ? 'Create' : 'Save'}
        busy={saveSize.isPending}
        error={error}
        onSubmit={(v) => { setError(null); saveSize.mutate(v) }}
      />
    </div>
  )
}
