import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  UploadCloud, Image as ImageIcon, Plus, Trash2, Eye,
  Sparkles, CheckCircle2, ArrowLeft, Search, Star,
  Palette, RefreshCw, X, FolderHeart, Info, HardDrive,
  Grid, List as ListIcon, Check, ShieldCheck, Database
} from 'lucide-react'
import {
  isSupabaseConfigured,
  getPortfoliosFromDB,
  uploadPortfolioImage,
  insertPortfolioToDB,
  deletePortfolioFromDB,
  toggleFeaturedInDB,
  getThumbnailUrl
} from './lib/supabase'

export interface AdminPortfolioItem {
  id: number
  category: 'illustration' | 'chibi' | 'live2d' | 'skeb'
  title: string
  subtitle: string
  image: string
  dateAdded?: string
  isFeatured?: boolean
  tags?: string[]
}

const INITIAL_ARTWORKS: AdminPortfolioItem[] = []

const SAMPLE_PRESET_IMAGES = [
  { label: 'Original Character', url: '/Original Character.png' },
  { label: 'Pastel Fantasy 1', url: 'https://picsum.photos/seed/samplefox1/600/800' },
  { label: 'Pastel Fantasy 2', url: 'https://picsum.photos/seed/samplefox2/600/600' },
  { label: 'Pastel Fantasy 3', url: 'https://picsum.photos/seed/samplefox3/600/750' },
]

interface AdminPortfolioPageProps {
  onExit: () => void
}

export default function AdminPortfolioPage({ onExit }: AdminPortfolioPageProps) {
  const [artworks, setArtworks] = useState<AdminPortfolioItem[]>(INITIAL_ARTWORKS)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Upload Form State
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [category, setCategory] = useState<'illustration' | 'chibi' | 'live2d' | 'skeb'>('illustration')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(['New Artwork'])
  const [isFeatured, setIsFeatured] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [fileSize, setFileSize] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingDB, setIsLoadingDB] = useState(false)
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload')

  // Lightbox Preview Modal State
  const [previewItem, setPreviewItem] = useState<AdminPortfolioItem | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Fetch portfolios from Supabase on mount if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return

    async function loadFromSupabase() {
      try {
        setIsLoadingDB(true)
        const dbItems = await getPortfoliosFromDB()
        if (dbItems && dbItems.length > 0) {
          const mapped: AdminPortfolioItem[] = dbItems.map(item => ({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            category: item.category,
            image: item.image_url,
            isFeatured: item.is_featured,
            tags: item.tags || [],
            dateAdded: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US') : 'Active',
          }))
          setArtworks(mapped)
        }
      } catch (err: unknown) {
        console.error('Failed to load from Supabase:', err)
        showToast('⚠️ Could not load data from Supabase. Falling back to local data.')
      } finally {
        setIsLoadingDB(false)
      }
    }

    loadFromSupabase()
  }, [])

  // Handle local image file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Please select a valid image file (PNG, JPG, WebP).')
      return
    }

    setSelectedFile(file)
    setFileName(file.name)
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2)
    setFileSize(`${sizeInMb} MB`)

    const reader = new FileReader()
    reader.onload = event => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Please select a valid image file (PNG, JPG, WebP).')
      return
    }

    setSelectedFile(file)
    setFileName(file.name)
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2)
    setFileSize(`${sizeInMb} MB`)

    const reader = new FileReader()
    reader.onload = event => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAddTag = () => {
    if (!tagInput.trim()) return
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
    }
    setTagInput('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  // Reset form
  const handleResetForm = () => {
    setTitle('')
    setSubtitle('')
    setCategory('illustration')
    setTags(['New Artwork'])
    setIsFeatured(false)
    setSelectedFile(null)
    setImagePreview(null)
    setFileName('')
    setFileSize('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Submit new artwork (Supabase Cloud + Local Fallback)
  const handleSubmitArtwork = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      showToast('⚠️ Please provide an artwork title.')
      return
    }

    setIsSubmitting(true)

    try {
      let finalImageUrl = imagePreview || '/Original Character.png'

      if (isSupabaseConfigured && selectedFile) {
        showToast('⏳ Uploading image to Supabase Storage...')
        finalImageUrl = await uploadPortfolioImage(selectedFile)
      }

      if (isSupabaseConfigured) {
        showToast('⏳ Saving artwork record to Supabase Database...')
        const savedRow = await insertPortfolioToDB({
          title: title.trim(),
          subtitle: subtitle.trim() || 'New Artwork',
          category,
          image_url: finalImageUrl,
          is_featured: isFeatured,
          tags: tags.length > 0 ? tags : [category.toUpperCase()],
        })

        const newItem: AdminPortfolioItem = {
          id: savedRow.id,
          title: savedRow.title,
          subtitle: savedRow.subtitle,
          category: savedRow.category,
          image: savedRow.image_url,
          isFeatured: savedRow.is_featured,
          tags: savedRow.tags,
          dateAdded: 'Today',
        }

        setArtworks(prev => [newItem, ...prev])
        showToast('✨ Successfully published to Supabase Database.')
      } else {
        // Fallback demo state
        const newItem: AdminPortfolioItem = {
          id: Date.now(),
          title: title.trim(),
          subtitle: subtitle.trim() || 'New Artwork',
          category,
          image: finalImageUrl,
          dateAdded: 'Today',
          isFeatured,
          tags: tags.length > 0 ? tags : [category.toUpperCase()],
        }

        setArtworks(prev => [newItem, ...prev])
        showToast('✨ Artwork added to portfolio (Demo Mode).')
      }

      handleResetForm()
      setActiveTab('manage')
    } catch (err: unknown) {
      console.error('Submit artwork error:', err)
      const errorMsg = err instanceof Error ? err.message : 'An error occurred while saving'
      showToast(`❌ Error: ${errorMsg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Toggle Featured status
  const handleToggleFeatured = async (id: number) => {
    const target = artworks.find(item => item.id === id)
    if (!target) return

    const newStatus = !target.isFeatured

    // Optimistic UI update
    setArtworks(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isFeatured: newStatus } : item
      )
    )

    if (isSupabaseConfigured) {
      try {
        await toggleFeaturedInDB(id, newStatus)
        showToast('Featured status updated in Supabase.')
      } catch (err) {
        console.error('Error toggling featured:', err)
        showToast('⚠️ Could not update featured status in Supabase.')
      }
    } else {
      showToast('Featured status updated.')
    }
  }

  // Delete artwork
  const handleDeleteArtwork = async (id: number, itemTitle: string) => {
    if (!window.confirm(`Are you sure you want to remove "${itemTitle}" from the portfolio?`)) return

    // Optimistic UI update
    setArtworks(prev => prev.filter(item => item.id !== id))

    if (isSupabaseConfigured) {
      try {
        await deletePortfolioFromDB(id)
        showToast(`🗑️ "${itemTitle}" deleted from Supabase.`)
      } catch (err) {
        console.error('Error deleting from Supabase:', err)
        showToast('⚠️ Could not delete from Supabase.')
      }
    } else {
      showToast(`🗑️ "${itemTitle}" removed from portfolio.`)
    }
  }

  // Filter artworks
  const filteredArtworks = artworks.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
    return matchesCategory && matchesSearch
  })

  // Category counts
  const countStats = {
    total: artworks.length,
    illustration: artworks.filter(a => a.category === 'illustration').length,
    chibi: artworks.filter(a => a.category === 'chibi').length,
    live2d: artworks.filter(a => a.category === 'live2d').length,
    skeb: artworks.filter(a => a.category === 'skeb').length,
  }

  return (
    <div className="min-h-screen bg-slate-50 text-sky-900 flex flex-col font-sans selection:bg-sky-200">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl bg-sky-900/95 text-white backdrop-blur-md shadow-2xl flex items-center gap-3 border border-sky-700/50 text-sm font-medium"
          >
            <Sparkles size={16} className="text-amber-300 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-xs px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Secret Admin Badge */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src="/Original Character.png"
                alt="Mittsunee"
                className="w-10 h-10 rounded-full object-cover border-2 border-sky-300 shadow-xs"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-sky-950 font-display">
                  Mittsunee Studio
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-700 border border-sky-200/80">
                  <ShieldCheck size={12} className="text-sky-600" />
                  Admin
                </span>
              </div>
              <p className="text-xs text-sky-400 flex items-center gap-1.5 font-medium">
                <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-500 border border-slate-200">/cyela</span>
                <span>• Portfolio Management & Upload</span>
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5">
            {/* Supabase Connection Status Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${
                isSupabaseConfigured
                  ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50/80 text-amber-700 border-amber-200'
              }`}
              title={
                isSupabaseConfigured
                  ? 'Connected to Supabase Cloud Database'
                  : 'Not connected to Supabase (using demo local storage)'
              }
            >
              <Database size={12} className={isSupabaseConfigured ? 'text-emerald-600' : 'text-amber-600'} />
              <span>{isSupabaseConfigured ? 'Supabase: Connected 🟢' : 'Supabase: Demo Mode 🟡'}</span>
              {isLoadingDB && <RefreshCw size={11} className="animate-spin text-emerald-600 ml-1" />}
            </div>

            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 transition-all active:scale-95 cursor-pointer shadow-2xs group"
              title="Return to public portfolio website"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Website</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {/* Top Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
              <FolderHeart size={20} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-sky-400 uppercase tracking-wider">Total Artworks</p>
              <h3 className="text-xl font-bold text-sky-950">{countStats.total}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
              <Palette size={20} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-sky-400 uppercase tracking-wider">Illustration</p>
              <h3 className="text-xl font-bold text-sky-950">{countStats.illustration}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-sky-400 uppercase tracking-wider">Chibi Art</p>
              <h3 className="text-xl font-bold text-sky-950">{countStats.chibi}</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-sky-400 uppercase tracking-wider">Live2D Rig</p>
              <h3 className="text-xl font-bold text-sky-950">{countStats.live2d}</h3>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-sky-100 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <HardDrive size={20} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-sky-400 uppercase tracking-wider">Skeb / Other</p>
              <h3 className="text-xl font-bold text-sky-950">{countStats.skeb}</h3>
            </div>
          </div>
        </div>

        {/* Tab Selector: Upload New vs Manage Artworks */}
        <div className="flex items-center justify-between border-b border-sky-100 pb-2 gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-sky-100/60 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white text-sky-600 shadow-xs'
                  : 'text-sky-500 hover:text-sky-700'
              }`}
            >
              <Plus size={15} />
              <span>Upload New Artwork</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'manage'
                  ? 'bg-white text-sky-600 shadow-xs'
                  : 'text-sky-500 hover:text-sky-700'
              }`}
            >
              <Grid size={15} />
              <span>Portfolio Collection ({artworks.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-sky-400">
            <Info size={14} />
            <span>Database status: {isSupabaseConfigured ? 'Synced with Supabase' : 'Demo Local Mode'}</span>
          </div>
        </div>

        {/* SECTION 1: UPLOAD FORM & LIVE PREVIEW */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Column */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-sky-100 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-sky-950 flex items-center gap-2">
                  <UploadCloud className="text-sky-500" size={20} />
                  Artwork Upload Form
                </h2>
                <p className="text-xs text-sky-400 mt-1">
                  Publish new illustrations, chibis, or models to the public portfolio gallery.
                </p>
              </div>

              <form onSubmit={handleSubmitArtwork} className="space-y-5">
                {/* File Dropzone Area */}
                <div>
                  <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-2">
                    Artwork Image *
                  </label>
                  <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      imagePreview
                        ? 'border-sky-300 bg-sky-50/40 hover:bg-sky-50/70'
                        : 'border-sky-200 hover:border-sky-400 bg-slate-50/60 hover:bg-sky-50/30'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {imagePreview ? (
                      <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-sky-200 shadow-2xs shrink-0"
                        />
                        <div className="space-y-1 min-w-0 flex-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                            <Check size={11} /> File Selected
                          </span>
                          <p className="text-xs font-bold text-sky-900 truncate">
                            {fileName || 'Artwork Image'}
                          </p>
                          <p className="text-[11px] text-sky-400">
                            Size: {fileSize || '~1.2 MB'}
                          </p>
                          <p className="text-[11px] text-sky-500 underline pt-1">
                            Click to choose a different file
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 py-3">
                        <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-500 mx-auto flex items-center justify-center">
                          <UploadCloud size={24} />
                        </div>
                        <p className="text-xs font-bold text-sky-900">
                          Drag and drop an image here, or <span className="text-sky-500 underline">browse files</span>
                        </p>
                        <p className="text-[11px] text-sky-400">
                          Supports PNG, JPG, and WebP (Portrait or square aspect ratio recommended)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Preset quick buttons */}
                  <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-sky-400 font-medium">Quick Presets:</span>
                    {SAMPLE_PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImagePreview(preset.url)
                          setFileName(preset.label)
                          setFileSize('Web Asset')
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-100 transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Fields: Title & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">
                      Artwork Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Starlight Kitsune"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sky-200 text-xs text-sky-950 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 bg-white shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">
                      Subtitle / Shot Type
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={e => setSubtitle(e.target.value)}
                      placeholder="e.g. Full Body + Detailed Background"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sky-200 text-xs text-sky-950 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 bg-white shadow-2xs"
                    />
                  </div>
                </div>

                {/* Category Radio Selector */}
                <div>
                  <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-2">
                    Portfolio Category *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'illustration' as const, label: 'Illustration', icon: '🎨' },
                      { id: 'chibi' as const, label: 'Chibi Art', icon: '🌸' },
                      { id: 'live2d' as const, label: 'Live2D Model', icon: '✨' },
                      { id: 'skeb' as const, label: 'Skeb / Sketch', icon: '📝' },
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          category === cat.id
                            ? 'bg-sky-400 text-white border-sky-400 shadow-xs'
                            : 'bg-white hover:bg-sky-50 text-sky-700 border-sky-200/80'
                        }`}
                      >
                        <span className="text-base">{cat.icon}</span>
                        <span className="text-xs font-bold">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags & Featured Checkbox */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">
                      Artwork Tags
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                        placeholder="Type tag and press enter"
                        className="flex-1 px-3.5 py-2 rounded-xl border border-sky-200 text-xs text-sky-950 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-3 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    {/* Tags list */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tags.map((t, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-sky-50 text-sky-600 border border-sky-200/60 font-medium"
                        >
                          #{t}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="hover:text-rose-500 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">
                      Display Options
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-sky-200/80 bg-sky-50/40 hover:bg-sky-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={e => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 border-sky-300 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                          <Star size={13} className="text-amber-400 fill-amber-400" />
                          Mark as Featured
                        </span>
                        <p className="text-[11px] text-sky-400">
                          Pin this piece to highlighted spots in the gallery
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-3 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Saving Artwork...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>Publish to Portfolio</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Live Preview Column */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-sky-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-sky-950 flex items-center gap-2">
                    <Eye size={16} className="text-sky-500" />
                    Public Gallery Live Preview
                  </h3>
                  <p className="text-[11px] text-sky-400">
                    Card appearance as seen by site visitors.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                  Preview
                </span>
              </div>

              {/* Mock Portfolio Card */}
              <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100 flex justify-center">
                <div className="w-full max-w-xs group relative rounded-2xl overflow-hidden bg-white border border-sky-100 shadow-md hover:shadow-xl transition-all">
                  <div className="relative aspect-3/4 overflow-hidden bg-sky-100">
                    <img
                      src={imagePreview || '/Original Character.png'}
                      alt={title || 'Preview Artwork'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Category & Featured Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-sky-600 backdrop-blur-xs shadow-2xs uppercase">
                        {category}
                      </span>
                      {isFeatured && (
                        <span className="p-1 rounded-full bg-amber-400 text-white shadow-2xs" title="Featured">
                          <Star size={10} fill="currentColor" />
                        </span>
                      )}
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-sky-950/20 to-transparent opacity-90 transition-opacity" />

                    {/* Title overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white">
                      <p className="text-xs font-bold leading-tight drop-shadow-xs">
                        {title || 'Sample Artwork Title'}
                      </p>
                      <p className="text-[11px] text-sky-200 mt-0.5 leading-tight">
                        {subtitle || 'Subtitle / Shot Type'}
                      </p>
                      {tags.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {tags.slice(0, 2).map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] px-1.5 py-0.2 rounded bg-white/20 backdrop-blur-xs text-sky-100"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick instructions box */}
              <div className="bg-sky-50/80 rounded-2xl p-4 border border-sky-100/80 space-y-2 text-xs text-sky-700">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles size={14} className="text-sky-500" />
                  Mittsunee Upload Notes:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-sky-600">
                  <li>Vertical aspect ratios (3:4 or 4:5) look best in the gallery grid.</li>
                  <li>Selecting "Live2D" automatically routes to the VTuber model filter.</li>
                  <li>Uploaded items sync directly to the portfolio database.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: MANAGE PORTFOLIO ITEMS (LIST & GRID) */}
        {activeTab === 'manage' && (
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-sky-100 shadow-sm space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'illustration', label: 'Illustration' },
                  { id: 'chibi', label: 'Chibi' },
                  { id: 'live2d', label: 'Live2D' },
                  { id: 'skeb', label: 'Skeb' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFilterCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      filterCategory === cat.id
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'bg-sky-50 text-sky-600 hover:bg-sky-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search & Layout toggle */}
              <div className="flex items-center gap-2.5">
                <div className="relative flex-1 sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search artworks..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-sky-200 text-xs text-sky-950 focus:outline-none focus:ring-2 focus:ring-sky-400/40 bg-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="flex items-center bg-sky-50 p-1 rounded-xl border border-sky-100">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'grid' ? 'bg-white text-sky-600 shadow-2xs' : 'text-sky-400 hover:text-sky-600'
                    }`}
                    title="Grid View"
                  >
                    <Grid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'table' ? 'bg-white text-sky-600 shadow-2xs' : 'text-sky-400 hover:text-sky-600'
                    }`}
                    title="Table View"
                  >
                    <ListIcon size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Artworks Display */}
            {filteredArtworks.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-sky-50/40 rounded-2xl border border-dashed border-sky-200">
                <ImageIcon size={36} className="text-sky-300 mx-auto" />
                <p className="text-sm font-bold text-sky-800">No matching artworks found</p>
                <p className="text-xs text-sky-400">Try adjusting your search query or switching categories.</p>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredArtworks.map(item => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl border border-sky-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-3/4 overflow-hidden bg-sky-100">
                      <img
                        src={getThumbnailUrl(item.image, 480, 80)}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 will-change-transform"
                      />
                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-sky-600 backdrop-blur-xs uppercase shadow-2xs">
                          {item.category}
                        </span>
                      </div>

                      {/* Top Action: Star */}
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(item.id)}
                        className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer ${
                          item.isFeatured
                            ? 'bg-amber-400 text-white shadow-xs'
                            : 'bg-white/80 text-slate-400 hover:text-amber-500'
                        }`}
                        title={item.isFeatured ? 'Featured piece' : 'Mark as Featured'}
                      >
                        <Star size={12} fill={item.isFeatured ? 'currentColor' : 'none'} />
                      </button>

                      {/* Hover Action overlay */}
                      <div className="absolute inset-0 bg-sky-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="w-8 h-8 rounded-full bg-white text-sky-700 hover:bg-sky-50 flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
                          title="View full preview"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteArtwork(item.id, item.title)}
                          className="w-8 h-8 rounded-full bg-rose-500 text-white hover:bg-rose-600 flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
                          title="Delete artwork"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-sky-950 truncate" title={item.title}>
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-sky-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-sky-50 flex items-center justify-between text-[10px] text-sky-400">
                        <span>{item.dateAdded || 'Active'}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="text-sky-500 hover:text-sky-700 font-semibold cursor-pointer"
                          >
                            View
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteArtwork(item.id, item.title)}
                            className="text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* TABLE VIEW */
              <div className="overflow-x-auto rounded-2xl border border-sky-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-sky-50/80 text-sky-700 font-bold border-b border-sky-100">
                    <tr>
                      <th className="py-3 px-4">Artwork</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Tags</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-100/60">
                    {filteredArtworks.map(item => (
                      <tr key={item.id} className="hover:bg-sky-50/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={getThumbnailUrl(item.image, 120, 75)}
                              alt={item.title}
                              loading="lazy"
                              decoding="async"
                              className="w-10 h-10 rounded-lg object-cover border border-sky-200 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-sky-950">{item.title}</p>
                              <p className="text-[11px] text-sky-400">{item.subtitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 uppercase">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {item.tags?.map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600"
                              >
                                #{t}
                              </span>
                            )) || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(item.id)}
                            className="cursor-pointer"
                          >
                            <Star
                              size={15}
                              className={item.isFeatured ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                            />
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewItem(item)}
                              className="p-1.5 rounded-lg text-sky-500 hover:bg-sky-100 cursor-pointer"
                              title="View image"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArtwork(item.id, item.title)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                              title="Delete artwork"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Lightbox Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewItem(null)}
            className="fixed inset-0 z-50 bg-sky-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-sky-100 space-y-4 p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    {previewItem.category}
                  </span>
                  <h3 className="text-base font-bold text-sky-950">{previewItem.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-500 text-slate-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden bg-sky-50 max-h-[60vh] flex items-center justify-center">
                <img
                  src={previewItem.image}
                  alt={previewItem.title}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-sky-500 pt-1">
                <span>{previewItem.subtitle}</span>
                <span className="text-sky-400">{previewItem.dateAdded || 'Active'}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
