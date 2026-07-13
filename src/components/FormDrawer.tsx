import { useEffect, useState } from 'react'
import Drawer from './Drawer'

export type Field = {
  name: string
  label: string
  type?: 'text' | 'number' | 'password' | 'select' | 'switch'
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
  /** 1 = half width, 2 = full width (in the 2-col grid). Default 1. */
  colSpan?: 1 | 2
}

export type FormValues = Record<string, string | boolean>

const inputCls =
  'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]'

function RequiredTag({ required }: { required?: boolean }) {
  return required ? (
    <span className="ml-1.5 rounded bg-[var(--color-accent-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-accent)]">
      Required
    </span>
  ) : (
    <span className="ml-1.5 rounded bg-[var(--color-bg)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-muted)]">
      Optional
    </span>
  )
}

export function FormDrawer({
  open,
  onClose,
  title,
  fields,
  initial,
  submitLabel = 'Save',
  busy,
  error,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  title: string
  fields: Field[]
  initial?: FormValues
  submitLabel?: string
  busy?: boolean
  error?: string | null
  onSubmit: (values: FormValues) => void
}) {
  const [values, setValues] = useState<FormValues>({})
  const [onlyRequired, setOnlyRequired] = useState(false)

  // Seed the form each time the drawer opens (empty for add, row data for edit).
  useEffect(() => {
    if (!open) return
    const seed: FormValues = {}
    for (const f of fields) {
      seed[f.name] = initial?.[f.name] ?? (f.type === 'switch' ? false : '')
    }
    setValues(seed)
    setOnlyRequired(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const set = (name: string, v: string | boolean) =>
    setValues((s) => ({ ...s, [name]: v }))

  const missing = fields.some(
    (f) => f.required && (values[f.name] === '' || values[f.name] === undefined),
  )

  const shown = onlyRequired ? fields.filter((f) => f.required) : fields

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-muted)] hover:bg-[var(--color-bg)]"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(values)}
            disabled={busy || missing}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Saving…' : submitLabel}
          </button>
        </div>
      }
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-[var(--color-ink)]">Main info</div>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--color-muted)]">
          <input
            type="checkbox"
            checked={onlyRequired}
            onChange={() => setOnlyRequired((v) => !v)}
            className="h-3.5 w-3.5 accent-[var(--color-accent)]"
          />
          Show only required fields
        </label>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-[var(--color-accent-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {shown.map((f) => (
          <div key={f.name} className={f.colSpan === 2 || f.type === 'switch' ? 'col-span-2' : 'col-span-1'}>
            {f.type === 'switch' ? (
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {f.label}
                  <RequiredTag required={f.required} />
                </span>
                <input
                  type="checkbox"
                  checked={!!values[f.name]}
                  onChange={(e) => set(f.name, e.target.checked)}
                  className="h-5 w-9 cursor-pointer accent-[var(--color-accent)]"
                />
              </label>
            ) : (
              <>
                <label className="mb-1 flex items-center text-xs font-medium text-[var(--color-muted)]">
                  {f.label}
                  <RequiredTag required={f.required} />
                </label>
                {f.type === 'select' ? (
                  <select
                    value={String(values[f.name] ?? '')}
                    onChange={(e) => set(f.name, e.target.value)}
                    className={inputCls}
                  >
                    <option value="" disabled>
                      Select…
                    </option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type === 'password' ? 'text' : f.type === 'number' ? 'number' : 'text'}
                    value={String(values[f.name] ?? '')}
                    placeholder={f.placeholder}
                    onChange={(e) => set(f.name, e.target.value)}
                    className={inputCls}
                  />
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </Drawer>
  )
}
