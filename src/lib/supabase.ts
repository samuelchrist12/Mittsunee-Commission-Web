import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-ref.supabase.co'
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface PortfolioRow {
  id: number
  title: string
  subtitle: string
  category: 'illustration' | 'chibi' | 'live2d' | 'skeb'
  image_url: string
  is_featured: boolean
  tags: string[]
  created_at?: string
}

/**
 * Returns the direct artwork image URL ensuring true aspect ratio and pristine quality.
 */
export function getThumbnailUrl(url: string): string {
  return url
}

// ─── Supabase Database Functions ─────────────────────────────────────────────

/**
 * Fetch all artworks from 'portfolios' table
 */
export async function getPortfoliosFromDB(): Promise<PortfolioRow[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching portfolios from Supabase:', error.message)
    throw error
  }

  return (data as PortfolioRow[]) || []
}

/**
 * Upload image file to Supabase Storage (Bucket: 'portfolio')
 * Returns the public URL for web access
 */
export async function uploadPortfolioImage(file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase client is not configured.')

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
  const filePath = `artworks/${fileName}`

  // Upload to bucket 'portfolio'
  const { error: uploadError } = await supabase.storage
    .from('portfolio')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    console.error('Error uploading image to Supabase Storage:', uploadError.message)
    throw uploadError
  }

  // Get public image URL
  const { data: publicUrlData } = supabase.storage
    .from('portfolio')
    .getPublicUrl(filePath)

  return publicUrlData.publicUrl
}

/**
 * Save new artwork item to 'portfolios' table
 */
export async function insertPortfolioToDB(newItem: Omit<PortfolioRow, 'id' | 'created_at'>): Promise<PortfolioRow> {
  if (!supabase) throw new Error('Supabase client is not configured.')

  const { data, error } = await supabase
    .from('portfolios')
    .insert([newItem])
    .select()
    .single()

  if (error) {
    console.error('Error inserting portfolio to Supabase:', error.message)
    throw error
  }

  return data as PortfolioRow
}

/**
 * Delete artwork from 'portfolios' table by ID
 */
export async function deletePortfolioFromDB(id: number): Promise<void> {
  if (!supabase) throw new Error('Supabase client is not configured.')

  const { error } = await supabase
    .from('portfolios')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting portfolio from Supabase:', error.message)
    throw error
  }
}

/**
 * Toggle is_featured status for an artwork
 */
export async function toggleFeaturedInDB(id: number, isFeatured: boolean): Promise<void> {
  if (!supabase) throw new Error('Supabase client is not configured.')

  const { error } = await supabase
    .from('portfolios')
    .update({ is_featured: isFeatured })
    .eq('id', id)

  if (error) {
    console.error('Error toggling featured in Supabase:', error.message)
    throw error
  }
}
