import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'

async function loadServiceLabels(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('services').select('id, title_en')
  if (error) throw error
  return Object.fromEntries((data ?? []).map((s) => [s.id, (s.title_en as string) || s.id]))
}

export function useServiceLabels() {
  return useQuery({
    queryKey: ['service-labels'],
    queryFn: loadServiceLabels,
    staleTime: 60_000,
  })
}

export function labelFor(map: Record<string, string> | undefined, id: string | null | undefined) {
  if (!id) return 'Photo'
  return map?.[id] ?? id
}