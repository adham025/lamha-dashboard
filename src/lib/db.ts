import { supabase } from './supabase'
export type Profile = {
  id: string
  display_name: string | null
  email: string | null
  auth_method: string | null
  created_at: string
}

type NamedProfile = { display_name: string | null } | null

export type StaffMember = {
  id: string
  email: string
  full_name: string | null
  role: string
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
      .select('id, display_name, email, auth_method, created_at')
      .order('created_at', { ascending: false }),
  )

export const fetchStaff = () =>
  unwrap<StaffMember[]>(
    supabase
      .from('staff')
      .select('id, email, full_name, role, active, created_at')
      .order('created_at', { ascending: true }),
  )

export type Upload = {
  id: string
  profile_id: string
  storage_path: string
  moderation: 'pending' | 'approved' | 'flagged' | 'rejected'
  created_at: string
  profiles: NamedProfile
}

export type Discount = {
  id: string
  code: string
  kind: 'fixed' | 'percentage'
  amount: number
  active: boolean
  usage_limit: number | null
  times_used: number
  min_order_amount: number | null
  expires_at: string | null
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

export const fetchConfig = () =>
  unwrap<ConfigRow[]>(
    supabase
      .from('app_config')
      .select('key, value, label, grp, sort')
      .order('grp', { ascending: true })
      .order('sort', { ascending: true }),
  )

export async function updateConfig(key: string, value: string) {
  const { data, error } = await supabase
    .from('app_config')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)
    .select('key')
    .maybeSingle()
  if (error) throw error
  if (!data) {
    throw new Error(
      `Could not save “${key}”. Check that you have Settings → edit permission, or ask an owner to apply migration 0026.`,
    )
  }
}

export type CmsPageRow = {
  slug: string
  grp: string
  title_en: string
  title_ar: string
  body_en: string
  body_ar: string
  effective_date: string | null
  sort: number
  updated_at: string
}

export const fetchCmsPages = () =>
  unwrap<CmsPageRow[]>(
    supabase
      .from('cms_pages')
      .select('slug, grp, title_en, title_ar, body_en, body_ar, effective_date, sort, updated_at')
      .order('sort', { ascending: true }),
  )

export type FaqRow = {
  id: string
  question_en: string
  question_ar: string
  answer_en: string
  answer_ar: string
  sort: number
  active: boolean
  updated_at: string
}

export const fetchFaqItems = () =>
  unwrap<FaqRow[]>(
    supabase
      .from('faq_items')
      .select('id, question_en, question_ar, answer_en, answer_ar, sort, active, updated_at')
      .order('sort', { ascending: true }),
  )

export async function updateFaqItem(
  id: string,
  patch: Partial<Pick<FaqRow, 'question_en' | 'question_ar' | 'answer_en' | 'answer_ar' | 'sort' | 'active'>>,
) {
  const { error } = await supabase
    .from('faq_items')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function updateCmsPage(
  slug: string,
  patch: Partial<Pick<CmsPageRow, 'title_en' | 'title_ar' | 'body_en' | 'body_ar' | 'effective_date'>>,
) {
  const { error } = await supabase
    .from('cms_pages')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('slug', slug)
  if (error) throw error
}

export const fetchDiscounts = () =>
  unwrap<Discount[]>(
    supabase
      .from('discounts')
      .select(
        'id, code, kind, amount, active, usage_limit, times_used, min_order_amount, expires_at, created_at',
      )
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

export type NotificationType = string

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
