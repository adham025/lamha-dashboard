import { supabase } from './supabase'

export type CmsPage = {
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

export async function fetchPublicCmsPage(slug: string): Promise<CmsPage | null> {
  const { data, error } = await supabase
    .from('cms_pages')
    .select('slug, grp, title_en, title_ar, body_en, body_ar, effective_date, sort, updated_at')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data as CmsPage | null
}

export async function fetchPublicCmsPages(): Promise<CmsPage[]> {
  const { data, error } = await supabase
    .from('cms_pages')
    .select('slug, grp, title_en, title_ar, body_en, body_ar, effective_date, sort, updated_at')
    .order('sort', { ascending: true })
  if (error) throw error
  return (data ?? []) as CmsPage[]
}