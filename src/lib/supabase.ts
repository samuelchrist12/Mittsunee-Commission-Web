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
 * Returns an optimized thumbnail URL using Supabase image transformation.
 * Uses `resize=contain` so the artwork is never cropped and maintains its natural aspect ratio.
 */
export function getThumbnailUrl(url: string, size = 500, quality = 80): string {
  if (!url) return ''
  if (url.includes('/storage/v1/object/public/')) {
    return url.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    ) + `?width=${size}&height=${size}&resize=contain&quality=${quality}`
  }
  return url
}

// ─── Client-side Cache ───────────────────────────────────────────────────────
const CACHE_KEY = 'mittsunee_portfolios_v2'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

type CacheClearListener = () => void
const cacheClearListeners: CacheClearListener[] = []

export function registerCacheClearListener(listener: CacheClearListener): () => void {
  cacheClearListeners.push(listener)
  return () => {
    const idx = cacheClearListeners.indexOf(listener)
    if (idx !== -1) cacheClearListeners.splice(idx, 1)
  }
}

export function clearPortfolioCache(): void {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(CACHE_KEY)
    } catch {
      // Ignore cache clear error
    }
  }
  for (const listener of cacheClearListeners) {
    try {
      listener()
    } catch (e) {
      console.error('Error in cache clear listener:', e)
    }
  }
}

// ─── Supabase Database Functions ─────────────────────────────────────────────

/**
 * Fetch artworks from 'portfolios' table with client-side session caching.
 * Avoids repeated database round-trips when switching tabs or reopening modals.
 */
export async function getPortfoliosFromDB(forceRefresh = false): Promise<PortfolioRow[]> {
  if (!supabase) return []

  // 1. Check session cache first
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS && Array.isArray(parsed.data) && parsed.data.length > 0) {
          return parsed.data as PortfolioRow[]
        }
      }
    } catch {
      // Fallback to fresh network fetch
    }
  }

  // 2. Fetch from Supabase
  const { data, error } = await supabase
    .from('portfolios')
    .select('id, title, subtitle, category, image_url, is_featured, tags, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching portfolios from Supabase:', error.message)
    throw error
  }

  const rows = (data as PortfolioRow[]) || []

  // 3. Store in session cache
  if (typeof window !== 'undefined' && rows.length > 0) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: rows,
      }))
    } catch {
      // Storage quota or privacy mode error ignored
    }
  }

  return rows
}

/**
 * Client-side image compressor before upload.
 * Resizes images exceeding 2200px and converts to WebP if supported,
 * preventing multi-megabyte payloads from bloating storage.
 */
async function compressImageForUpload(file: File): Promise<Blob> {
  // If file is already small (under 1.2MB) and is webp, keep as-is
  if (file.size < 1.2 * 1024 * 1024 && file.type === 'image/webp') {
    return file
  }

  return new Promise((resolve) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.onload = () => {
        const MAX_DIM = 2200
        let { width, height } = img

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width)
            width = MAX_DIM
          } else {
            width = Math.round((width * MAX_DIM) / height)
            height = MAX_DIM
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(blob)
            } else {
              resolve(file) // keep original if compression didn't save size
            }
          },
          'image/webp',
          0.88
        )
      }
      img.onerror = () => resolve(file)
      img.src = e.target?.result as string
    }
    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}

/**
 * Upload image file to Supabase Storage (Bucket: 'portfolio')
 * Automatically optimizes large images to WebP format before uploading.
 */
export async function uploadPortfolioImage(file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase client is not configured.')

  const compressedBlob = await compressImageForUpload(file)
  const isWebp = compressedBlob.type === 'image/webp'
  const fileExt = isWebp ? 'webp' : (file.name.split('.').pop() || 'png')
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
  const filePath = `artworks/${fileName}`

  // Upload to bucket 'portfolio'
  const { error: uploadError } = await supabase.storage
    .from('portfolio')
    .upload(filePath, compressedBlob, {
      contentType: compressedBlob.type || 'image/webp',
      cacheControl: '31536000', // 1 year cache
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

  clearPortfolioCache()
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

  clearPortfolioCache()
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

  clearPortfolioCache()
}
