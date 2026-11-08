import { supabase } from './supabase'
import { signUrls } from './db'

// ---- Statuses ---------------------------------------------------------------

export const STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Awaiting payment',
  payment_review: 'Payment to review',
  payment_rejected: 'Payment rejected',
  deposit_paid: 'Ready to edit',
  editing: 'At the studio',
  preview_ready: 'Waiting for customer',
  revision_requested: 'Changes requested',
  approved: 'Approved — to print',
  in_production: 'Printing',
  shipped: 'Out for delivery',
  delivered: 'Delivered',
  refused: 'Refused',
  cancelled: 'Cancelled',
}

export const STATUS_TONE: Record<string, string> = {
  pending_payment: 'bg-slate-100 text-slate-600',
  payment_review: 'bg-amber-100 text-amber-700',
  payment_rejected: 'bg-rose-100 text-[var(--color-danger)]',
  deposit_paid: 'bg-sky-100 text-sky-700',
  editing: 'bg-violet-100 text-[var(--color-secondary)]',
  preview_ready: 'bg-indigo-100 text-indigo-700',
  revision_requested: 'bg-orange-100 text-orange-700',
  approved: 'bg-teal-100 text-teal-700',
  in_production: 'bg-cyan-100 text-cyan-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-[var(--color-success)]',
  refused: 'bg-rose-100 text-[var(--color-danger)]',
  cancelled: 'bg-slate-100 text-slate-500',
}

export const ALL_STATUSES = Object.keys(STATUS_LABEL)
const TERMINAL = new Set(['delivered', 'refused', 'cancelled'])
export const isTerminal = (s: string) => TERMINAL.has(s)

/** Service ids → names (the same services the app lists). */
export const SERVICE_LABEL: Record<string, string> = {
  restore: 'Restore an old photo',
  passport: 'Passport / National ID',
  glowup: 'Portrait retouch',
  cartoon: 'Cartoon portrait',
  headshot: 'Pro headshot',
  wedding: 'Wedding glam',
  colorize: 'Colorize',
  graduation: 'Graduation cutout',
  background: 'Background swap',
}

// ---- Types ------------------------------------------------------------------

type One<T> = T | T[] | null

export type OrderItem = {
  id: string
  service_id: string | null
  size_id: string
  finish: string | null
  note: string | null
  unit_price: number
  quantity: number
  upload_id: string | null
  result_id: string | null
  uploads: One<{ storage_path: string }>
  results: One<{ storage_path: string; version: number; created_at: string }>
}

export type OrderAddress = {
  governorate: string
  city: string
  street: string
  building: string | null
  floor_apartment: string | null
  landmark: string | null
  delivery_phone: string
}

export type OrderFull = {
  id: string
  profile_id: string
  status: string
  product_total: number
  discount_code: string | null
  discount_amount: number
  deposit_amount: number
  balance_due: number
  delivery_fee: number
  cod_collected: number | null
  courier_tracking: string | null
  payment_proof_path: string | null
  payment_reference: string | null
  payment_submitted_at: string | null
  payment_reject_reason: string | null
  revision_count: number
  created_at: string
  profiles: One<{ display_name: string | null; email: string | null }>
  addresses: One<OrderAddress>
  print_order_items: OrderItem[]
  order_internal: One<{ studio_name: string | null; studio_cost: number | null; notes: string | null }>
}

export type OrderEventRow = { kind: string; note: string | null; created_at: string }

/** PostgREST types to-one embeds as arrays; at runtime they are single objects. */
export function one<T>(v: One<T> | undefined): T | null {
  if (!v) return null
  return Array.isArray(v) ? (v[0] ?? null) : v
}

export const shortId = (id: string) => id.slice(0, 8).toUpperCase()
export const customerName = (o: OrderFull) => {
  const p = one(o.profiles)
  return p?.display_name || p?.email || 'Customer'
}

const ORDER_SELECT = `id, profile_id, status, product_total, discount_code, discount_amount, deposit_amount,
  balance_due, delivery_fee, cod_collected, courier_tracking, payment_proof_path, payment_reference,
  payment_submitted_at, payment_reject_reason, revision_count, created_at,
  profiles(display_name, email),
  addresses(governorate, city, street, building, floor_apartment, landmark, delivery_phone),
  print_order_items(id, service_id, size_id, finish, note, unit_price, quantity, upload_id, result_id,
    uploads(storage_path), results(storage_path, version, created_at)),
  order_internal(studio_name, studio_cost, notes)`

export async function fetchOrdersFull(statuses?: string[]): Promise<OrderFull[]> {
  let q = supabase.from('print_orders').select(ORDER_SELECT).order('created_at', { ascending: true })
  if (statuses?.length) q = q.in('status', statuses)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as unknown as OrderFull[]
}

export async function fetchOrderFull(id: string): Promise<OrderFull> {
  const { data, error } = await supabase.from('print_orders').select(ORDER_SELECT).eq('id', id).single()
  if (error) throw error
  return data as unknown as OrderFull
}

export async function fetchOrderEvents(orderId: string): Promise<OrderEventRow[]> {
  const { data, error } = await supabase
    .from('order_events')
    .select('kind, note, created_at')
    .eq('order_id', orderId)
    .order('created_at')
  if (error) throw error
  return (data ?? []) as OrderEventRow[]
}

/** Signed URLs for everything an order shows: proof, originals, edited files. */
export async function fetchOrderMedia(o: OrderFull) {
  const proof = o.payment_proof_path ? await signUrls('payment-proofs', [o.payment_proof_path]) : new Map<string, string>()
  const originals = await signUrls(
    'uploads',
    o.print_order_items.map((i) => one(i.uploads)?.storage_path ?? ''),
  )
  const results = await signUrls(
    'results',
    o.print_order_items.map((i) => one(i.results)?.storage_path ?? ''),
  )
  return { proof, originals, results }
}

// ---- Actions (all go through the role-checked database functions) ------------

const ERRORS: Record<string, string> = {
  transition_not_allowed: 'Your role can’t make that change from the order’s current status.',
  missing_edited_files: 'Upload an edited file for every photo first.',
  note_required: 'A reason is required.',
  invalid_status: 'The order is not in the right status for that.',
  invalid_path: 'That file doesn’t belong to this customer.',
  not_allowed: 'Your role can’t do that.',
  not_staff: 'Your account isn’t an active staff member.',
}

export function explain(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e)
  return ERRORS[msg] ?? msg
}

export async function setStatus(orderId: string, status: string, note?: string, codCollected?: number) {
  const { error } = await supabase.rpc('staff_set_order_status', {
    p_order_id: orderId,
    p_status: status,
    p_note: note ?? null,
    p_cod_collected: codCollected ?? null,
  })
  if (error) throw new Error(error.message)
}

/** Uploads the edited file into the customer's folder, then records it as a new version. */
export async function uploadEdited(order: OrderFull, item: OrderItem, file: File) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const path = `${order.profile_id}/order_${order.id.slice(0, 8)}_${item.id.slice(0, 8)}_${Date.now()}.${ext}`
  const up = await supabase.storage.from('results').upload(path, file, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  })
  if (up.error) throw new Error(up.error.message)
  const { error } = await supabase.rpc('staff_attach_result', { p_item_id: item.id, p_storage_path: path })
  if (error) throw new Error(error.message)
}

export async function saveInternal(
  orderId: string,
  v: { studio_name: string; studio_cost: string; notes: string },
) {
  const { error } = await supabase.from('order_internal').upsert({
    order_id: orderId,
    studio_name: v.studio_name.trim() || null,
    studio_cost: v.studio_cost === '' ? null : Number(v.studio_cost),
    notes: v.notes.trim() || null,
    updated_at: new Date().toISOString(),
  })
  if (error) throw new Error(error.message)
}
