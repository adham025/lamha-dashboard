import { supabase } from './supabase'

export type FaqItem = {
  id: string
  question_en: string
  question_ar: string
  answer_en: string
  answer_ar: string
  sort: number
  active: boolean
}

export async function fetchPublicFaq(): Promise<FaqItem[]> {
  const { data, error } = await supabase
    .from('faq_items')
    .select('id, question_en, question_ar, answer_en, answer_ar, sort, active')
    .eq('active', true)
    .order('sort', { ascending: true })
  if (error) throw error
  return (data ?? []) as FaqItem[]
}