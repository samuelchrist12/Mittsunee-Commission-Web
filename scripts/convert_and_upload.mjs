import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://udilgelagkmivkdiaqyt.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaWxnZWxhZ2ttaXZrZGlhcXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4NTc3MTQsImV4cCI6MjEwNzQzMzcxNH0.qmGsGkOsP-cyQv5ylYgL8SvyUczV1M7GRvvoCm2hKZo'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const SOURCE_DIR = '/home/mueee/Documents/Mittsunee/IG'
const OUTPUT_DIR = '/home/mueee/Documents/Mittsunee/IG_WebP'

fs.mkdirSync(OUTPUT_DIR, { recursive: true })

function formatTitle(filename) {
  // Remove extension
  let name = filename.replace(/\.(jpg|jpeg|png|webp|JPG|JPEG|PNG)$/i, '')
  // Remove leading numbers (e.g. "01 ", "27 b ")
  name = name.replace(/^\d+\s*(b\s*)?/, '')
  // Clean double dots or dashes
  name = name.replace(/\.+$/, '').trim()

  // Specific title enhancements
  if (/furina/i.test(name)) return 'Furina'
  if (/miku/i.test(name)) return 'Hatsune Miku'
  if (/tokisaki/i.test(name)) return 'Kurumi Tokisaki'
  if (/futsuri black/i.test(name)) return 'Futsuri (Black Ver.)'
  if (/bonus botak/i.test(name)) return 'Bonus Sketch Chibi'
  if (/^18$/i.test(name)) return 'Character Illustration #18'
  if (/^IMG_2234$/i.test(name)) return 'Original Character'
  if (/^OC$/i.test(name)) return 'Original Character Portrait'

  // Capitalize words
  return name.replace(/\b\w/g, l => l.toUpperCase())
}

function determineCategory(filename) {
  const lower = filename.toLowerCase()
  if (lower.includes('chibi') || lower.includes('botak') || lower.includes('kumarin')) return 'chibi'
  if (lower.includes('live2d') || lower.includes('rig')) return 'live2d'
  if (lower.includes('bonus') || lower.includes('skeb') || lower.includes('sketch')) return 'skeb'
  return 'illustration'
}

function determineSubtitle(title, category) {
  if (category === 'chibi') return 'Chibi Character Art'
  if (category === 'skeb') return 'Sketch & Bonus'
  if (category === 'live2d') return 'Live2D Model Artwork'
  if (/furina|miku|tokisaki/i.test(title)) return 'Fanart Illustration'
  if (/futsuri/i.test(title)) return 'Original Character'
  return 'Full Illustration'
}

function determineTags(title, category) {
  const tags = []
  if (category === 'chibi') tags.push('Chibi')
  if (category === 'skeb') tags.push('Skeb')
  if (/furina|miku|tokisaki/i.test(title)) tags.push('Fanart')
  else tags.push('Original')

  if (/futsuri|setsuna|haruka|lucia|sierra/i.test(title)) tags.push('Featured')
  return tags
}

async function main() {
  console.log('🚀 Memulai proses konversi WebP & upload ke Supabase...')

  const files = fs.readdirSync(SOURCE_DIR)
    .filter(f => /\.(jpg|jpeg|png|webp|JPG|JPEG|PNG)$/i.test(f))
    .sort()

  console.log(`📁 Ditemukan ${files.length} file gambar di ${SOURCE_DIR}\n`)

  // 1. Hapus placeholder picsum dari database Supabase jika ada
  console.log('🧹 Membersihkan placeholder dummy di Supabase database...')
  const { error: delError } = await supabase
    .from('portfolios')
    .delete()
    .like('image_url', '%picsum.photos%')

  if (delError) {
    console.warn('Catatan: Gagal membersihkan placeholder atau sudah kosong:', delError.message)
  } else {
    console.log('✅ Placeholder dummy berhasil dibersihkan.')
  }

  const uploadedArtworks = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const inputPath = path.join(SOURCE_DIR, file)
    const baseName = path.parse(file).name.replace(/[^a-zA-Z0-9_-]/g, '_')
    const webpFileName = `${baseName}.webp`
    const outputPath = path.join(OUTPUT_DIR, webpFileName)

    process.stdout.write(`[${i + 1}/${files.length}] Mengonversi "${file}" -> WebP... `)

    // Konversi dengan FFmpeg (High Quality: preset drawing, quality 90)
    try {
      execSync(
        `ffmpeg -v error -i "${inputPath}" -c:v libwebp -preset drawing -quality 90 -y "${outputPath}"`,
        { stdio: 'inherit' }
      )
    } catch (err) {
      console.error(`\n❌ Gagal konversi ${file}:`, err.message)
      continue
    }

    const origStat = fs.statSync(inputPath)
    const webpStat = fs.statSync(outputPath)
    const origSizeMb = (origStat.size / (1024 * 1024)).toFixed(2)
    const webpSizeKb = (webpStat.size / 1024).toFixed(0)
    process.stdout.write(`OK (${origSizeMb} MB -> ${webpSizeKb} KB)\n`)

    // Upload ke Supabase Storage
    process.stdout.write(`       Mengunggah ke Supabase Storage... `)
    const fileBuffer = fs.readFileSync(outputPath)
    const storagePath = `artworks/${webpFileName}`

    const { error: uploadError } = await supabase.storage
      .from('portfolio')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/webp',
        upsert: true,
      })

    if (uploadError) {
      console.error(`\n❌ Gagal upload ke storage:`, uploadError.message)
      continue
    }

    const { data: publicUrlData } = supabase.storage
      .from('portfolio')
      .getPublicUrl(storagePath)

    const publicUrl = publicUrlData.publicUrl
    process.stdout.write(`OK!\n`)

    // Siapkan Metadata
    const title = formatTitle(file)
    const category = determineCategory(file)
    const subtitle = determineSubtitle(title, category)
    const tags = determineTags(title, category)
    const isFeatured = tags.includes('Featured') || i < 4

    // Simpan ke Supabase Database
    const { data: inserted, error: insertError } = await supabase
      .from('portfolios')
      .insert([{
        title,
        subtitle,
        category,
        image_url: publicUrl,
        is_featured: isFeatured,
        tags,
      }])
      .select()
      .single()

    if (insertError) {
      console.error(`       ❌ Gagal insert DB:`, insertError.message)
    } else {
      console.log(`       ✨ Terdaftar di database: "${title}" [${category}] (ID: ${inserted.id})`)
      uploadedArtworks.push(inserted)
    }

    console.log('')
  }

  console.log(`\n🎉 SELESAI! ${uploadedArtworks.length} karya berhasil dikonversi ke WebP dan diunggah ke Supabase!`)
}

main().catch(console.error)
