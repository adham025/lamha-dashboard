import { supabase } from './supabase'

export type PublicConfig = {
  play_store_url: string
  app_store_url: string
  support_whatsapp: string
  support_email: string
}

export async function fetchPublicConfig(): Promise<PublicConfig> {
  const { data, error } = await supabase
    .from('app_config')
    .select('key, value')
    .eq('is_public', true)
    .in('key', ['play_store_url', 'app_store_url', 'support_whatsapp', 'support_email'])
  if (error) throw error
  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? '']))
  return {
    play_store_url: map.play_store_url ?? '',
    app_store_url: map.app_store_url ?? '',
    support_whatsapp: map.support_whatsapp ?? '',
    support_email: map.support_email ?? '',
  }
}