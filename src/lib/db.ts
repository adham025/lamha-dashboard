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
}

export type StaffMember = {
  id: string
  email: string
  full_name: string | null
  role: StaffRole
  active: boolean
  created_at: string
}

async function unwrap<T>(p: PromiseLike<{ data: T | null; error: unknown }>): Promise<T> {
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
        'id, status, delivery_type, delivery_fee, product_total, deposit_amount, cod_collected, kashier_status, courier_tracking, created_at',
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
}

export type Subscription = {
  id: string
  profile_id: string
  tier: 'free' | 'plus' | 'pro'
  active: boolean
  renews_at: string | null
}

export type Referral = {
  id: string
  code: string
  rewarded: boolean
  created_at: string
}

export const fetchUploads = () =>
  unwrap<Upload[]>(
    supabase
      .from('uploads')
      .select('id, profile_id, storage_path, moderation, created_at')
      .order('created_at', { ascending: false }),
  )

export const fetchSubscriptions = () =>
  unwrap<Subscription[]>(
    supabase
      .from('subscriptions')
      .select('id, profile_id, tier, active, renews_at')
      .order('renews_at', { ascending: false }),
  )

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
