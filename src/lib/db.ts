import { supabase } from './supabase'
import type { StaffRole } from './nav'

export type Profile = {
  id: string
  display_name: string | null
  tier: 'free' | 'plus' | 'pro'
  auth_method: string | null
  referral_code: string | null
  created_at: string
}

export type AiJob = {
  id: number
  model: string | null
  provider: string | null
  reason_id: string
  cost_usd: number
  status: 'queued' | 'processing' | 'complete' | 'failed'
  created_at: string
}

type NamedProfile = { display_name: string | null } | null

export type PrintOrder = {
  id: string
  status: string
  delivery_type: 'standard' | 'express'
  delivery_fee: number
  product_total: number
  deposit_amount: number
  cod_collected: number | null
  kashier_status: string | null
  courier_tracking: string | null
  created_at: string
  profiles: NamedProfile
}

export type StaffMember = {
  id: string
  email: string
  full_name: string | null
  role: StaffRole
  active: boolean
  created_at: string
}

// Param is intentionally loose: PostgREST types embedded relations as arrays
// even for to-one FKs (which return a single object at runtime), so we decouple
// the resolved row shape from the caller-declared T and cast.
async function unwrap<T>(p: PromiseLike<{ data: unknown; error: unknown }>): Promise<T> {
  const { data, error } = await p
  if (error) throw error
  return (data ?? []) as T
}

export const fetchProfiles = () =>
  unwrap<Profile[]>(
    supabase
      .from('profiles')
      .select('id, display_name, tier, auth_method, referral_code, created_at')
      .order('created_at', { ascending: false }),
  )

export const fetchAiJobs = () =>
  unwrap<AiJob[]>(
    supabase
      .from('ai_jobs')
      .select('id, model, provider, reason_id, cost_usd, status, created_at')
      .order('created_at', { ascending: false }),
  )

export const fetchOrders = () =>
  unwrap<PrintOrder[]>(
    supabase
      .from('print_orders')
      .select(
        'id, status, delivery_type, delivery_fee, product_total, deposit_amount, cod_collected, kashier_status, courier_tracking, created_at, profiles(display_name)',
      )
      .order('created_at', { ascending: false }),
  )

export const fetchStaff = () =>
  unwrap<StaffMember[]>(
    supabase
      .from('staff')
      .select('id, email, full_name, role, active, created_at')
      .order('created_at', { ascending: true }),
  )

export const fetchSubscriptionsCount = async () => {
  const { count, error } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('active', true)
  if (error) throw error
  return count ?? 0
}

export type Upload = {
  id: string
  profile_id: string
  storage_path: string
  moderation: 'pending' | 'approved' | 'flagged' | 'rejected'
  created_at: string
  profiles: NamedProfile
}

export type Subscription = {
  id: string
  profile_id: string
  tier: 'free' | 'plus' | 'pro'
  active: boolean
  renews_at: string | null
  profiles: NamedProfile
}

export type Referral = {
  id: string
  code: string
  rewarded: boolean
  created_at: string
}

export type ConfigRow = {
  key: string
  value: string
  label: string
  grp: string
  sort: number
}

export const fetchUploads = () =>
  unwrap<Upload[]>(
    supabase
      .from('uploads')
      .select('id, profile_id, storage_path, moderation, created_at, profiles(display_name)')
      .order('created_at', { ascending: false }),
  )

export const fetchSubscriptions = () =>
  unwrap<Subscription[]>(
    supabase
      .from('subscriptions')
      .select('id, profile_id, tier, active, renews_at, profiles(display_name)')
      .order('renews_at', { ascending: false }),
  )

export const fetchConfig = () =>
  unwrap<ConfigRow[]>(
    supabase
      .from('app_config')
      .select('key, value, label, grp, sort')
      .order('grp', { ascending: true })
      .order('sort', { ascending: true }),
  )

export async function updateConfig(key: string, value: string) {
  const { error } = await supabase
    .from('app_config')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)
  if (error) throw error
}

export const fetchReferrals = () =>
  unwrap<Referral[]>(
    supabase
      .from('referrals')
      .select('id, code, rewarded, created_at')
      .order('created_at', { ascending: false }),
  )

/** Generic delete by id list (super_admin RLS). */
export async function deleteRows(table: string, ids: (string | number)[]) {
  const { error } = await supabase.from(table).delete().in('id', ids)
  if (error) throw error
}

/** Generic single-row update (super_admin RLS). */
export async function updateRow(
  table: string,
  id: string | number,
  patch: Record<string, unknown>,
) {
  const { error } = await supabase.from(table).update(patch).eq('id', id)
  if (error) throw error
}

/** Generic insert (super_admin RLS). */
export async function insertRow(table: string, values: Record<string, unknown>) {
  const { error } = await supabase.from(table).insert(values)
  if (error) throw error
}

// ---- Storage / images -----------------------------------------------------

/** Batch-sign object paths in a bucket → Map<path, signedUrl>. */
export async function signUrls(bucket: string, paths: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const unique = [...new Set(paths)].filter(Boolean)
  if (unique.length === 0) return map
  const { data } = await supabase.storage.from(bucket).createSignedUrls(unique, 3600)
  for (const d of data ?? []) if (d.signedUrl && d.path) map.set(d.path, d.signedUrl)
  return map
}

export type UploadWithUrl = Upload & { url: string | null }

/** Uploads for the moderation queue, each with a signed thumbnail URL. */
export async function fetchModerationMedia(): Promise<UploadWithUrl[]> {
  const rows = await fetchUploads()
  const urls = await signUrls('uploads', rows.map((r) => r.storage_path))
  return rows.map((r) => ({ ...r, url: urls.get(r.storage_path) ?? null }))
}

/** Re-verifies a Kashier deposit with Kashier itself (never trusts a stale
 * local value) — the same function the app calls, staff are also allowed to
 * invoke it (see check-kashier-status's auth check). */
export async function syncKashierStatus(orderId: string) {
  const { data, error } = await supabase.functions.invoke('check-kashier-status', {
    body: { order_id: orderId },
  })
  if (error) throw error
  return data as { ok: boolean; status?: string; raw?: string }
}

export type NotificationType = 'order_confirmed' | 'order_shipped' | 'order_delivered' | string

export type OrderNotification = {
  id: string
  type: NotificationType
  order_id: string | null
  read: boolean
  created_at: string
  profiles: NamedProfile
}

export const fetchNotifications = () =>
  unwrap<OrderNotification[]>(
    supabase
      .from('notifications')
      .select('id, type, order_id, read, created_at, profiles(display_name)')
      .order('created_at', { ascending: false }),
  )

export type OrderImage = { label: string; url: string }

/** Every result image attached to an order (multiple items = multiple images,
 * possibly of different people). */
export async function fetchOrderImages(orderId: string): Promise<OrderImage[]> {
  const { data, error } = await supabase
    .from('print_order_items')
    .select('size_id, results(storage_path)')
    .eq('order_id', orderId)
  if (error) throw error
  const items = (data ?? [])
    .map((i: Record<string, unknown>) => {
      const r = i.results as { storage_path?: string } | { storage_path?: string }[] | null
      const path = Array.isArray(r) ? r[0]?.storage_path : r?.storage_path
      return path ? { size_id: i.size_id as string, path } : null
    })
    .filter((x): x is { size_id: string; path: string } => !!x)
  const urls = await signUrls('results', items.map((i) => i.path))
  return items
    .map((i) => ({ label: i.size_id, url: urls.get(i.path) }))
    .filter((x): x is OrderImage => !!x.url)
}
