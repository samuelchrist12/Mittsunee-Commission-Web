import { useState, createContext, useContext, useCallback, useEffect, useRef } from 'react'
import type { Variants } from 'motion/react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Heart, Mail, ChevronDown, X, ExternalLink,
  ZoomIn, ChevronLeft, ChevronRight, Globe,
  ShoppingCart, MessageCircle, Star, Sparkles,
  Palette, Coins, FileText,
  Maximize2, Minimize2
} from 'lucide-react'
import AdminPortfolioPage from './AdminPortfolioPage'
import { isSupabaseConfigured, getPortfoliosFromDB } from './lib/supabase'



// ─── Types ──────────────────────────────────────────────────────────────────

type Currency = 'usd' | 'idr'
type CommissionStatus = 'open' | 'closed'
type ActivePage = 'portfolio' | 'pricing' | 'tos' | 'contact'

interface PortfolioItem {
  id: number
  category: 'illustration' | 'chibi' | 'live2d' | 'skeb'
  title: string
  subtitle: string
  image: string
}

interface PriceRow {
  shot: string
  usd: number
  idr: number
}

interface Addon {
  name: string
  usd?: number
  idr?: number
  label?: string
}

interface CommissionType {
  name: string
  note?: string
  prices: PriceRow[]
  addons: Addon[]
}

interface CommissionCategory {
  id: string
  name: string
  emoji: string
  desc: string
  types: CommissionType[]
}

interface ToSSection {
  id: string
  title: string
  items: string[]
  table?: { tier: string; usage: string; fee: string }[]
}

// ─── Data ───────────────────────────────────────────────────────────────────

const COMMISSION_STATUS: CommissionStatus = 'open'

const COMMISSION_DATA: CommissionCategory[] = [
  {
    id: 'illustration',
    name: 'Illustration',
    emoji: '🎨',
    desc: 'Detailed character illustrations with refined lineart and vibrant coloring.',
    types: [
      {
        name: 'Character Illustration',
        prices: [
          { shot: 'Bust Up', usd: 35, idr: 120_000 },
          { shot: 'Half Body', usd: 65, idr: 180_000 },
          { shot: 'Knee Up', usd: 75, idr: 200_000 },
          { shot: 'Full Body', usd: 100, idr: 250_000 },
        ],
        addons: [
          { name: '+1 Character', label: '+100% base price' },
          { name: 'Simple Background', label: 'Free' },
          { name: 'Complex Background', label: '+50% base price' },
          { name: 'Extra Details / Accessories', label: '+10–20%' },
        ],
      },
    ],
  },
  {
    id: 'chibi',
    name: 'Chibi',
    emoji: '🌸',
    desc: 'Adorable super-deformed chibi style — perfect for stickers and emotes.',
    types: [
      {
        name: 'Chibi Style',
        prices: [
          { shot: 'Head Shot', usd: 15, idr: 70_000 },
          { shot: 'Full Body', usd: 25, idr: 95_000 },
        ],
        addons: [
          { name: '+1 Character', label: '+100% base price' },
          { name: 'Simple Background', label: 'Free' },
          { name: 'Complex Background', label: '+50% base price' },
        ],
      },
    ],
  },
  {
    id: 'skeb',
    name: 'SKEB',
    emoji: '✨',
    desc: 'Leave the concept to me! Surprise commission — I pick pose, expression, and mood.',
    types: [
      {
        name: 'Surprise Art (SKEB)',
        note: 'Concept and style are entirely up to the artist. No revisions on design choices.',
        prices: [
          { shot: 'Bust Up', usd: 70, idr: 85_000 },
        ],
        addons: [
          { name: 'Background', label: 'Not included' },
        ],
      },
    ],
  },
  {
    id: 'live2d',
    name: 'Live2D',
    emoji: '🎭',
    desc: 'Fully rigged Live2D VTuber models. Tiers differ in rig complexity and expressions.',
    types: [
      {
        name: 'Full Body L2D Model',
        note: 'Tier 1 = basic rig | Tier 2 = advanced physics & expressions | Tier 3 = premium full package',
        prices: [
          { shot: 'Tier 1', usd: 300, idr: 1_000_000 },
          { shot: 'Tier 2', usd: 550, idr: 2_500_000 },
          { shot: 'Tier 3', usd: 750, idr: 4_500_000 },
        ],
        addons: [
          { name: 'Character Design by Artist', usd: 150, idr: 250_000 },
          { name: 'Dynamic Action Pose', usd: 200, idr: 700_000 },
          { name: '2nd Outfit', usd: 150, idr: 150_000 },
          { name: '2nd Hair Style', usd: 150, idr: 150_000 },
          { name: 'Pet / Prop', usd: 150, idr: 150_000 },
          { name: 'Riggable Finger Joints', usd: 150, idr: 150_000 },
          { name: 'Furry Character', usd: 150, idr: 150_000 },
          { name: 'Hand Toggle', usd: 150, idr: 150_000 },
          { name: 'Base Body (No Clothing)', usd: 150, idr: 150_000 },
        ],
      },
    ],
  },
]

const TOS_DATA: ToSSection[] = [
  {
    id: '01',
    title: 'Commercial Usage',
    table: [
      { tier: 'Tier 0 — Personal', usage: 'Private use only, no monetization', fee: 'Included' },
      { tier: 'Tier 1 — Streaming', usage: 'VTubing / streaming, under 10K subs', fee: '+10%' },
      { tier: 'Tier 2 — Content Creator', usage: 'YouTube, social, merch (small scale)', fee: '+25%' },
      { tier: 'Tier 3 — Commercial', usage: 'Brand, ads, large-scale merch', fee: '+50%' },
    ],
    items: [
      'All commissions default to Tier 0 (Personal).',
      'Discuss commercial intent before placing your order.',
      'Upgrading tier after delivery is possible with an additional fee.',
    ],
  },
  {
    id: '02',
    title: 'General Rules',
    items: [
      'I have the right to decline any commission for any reason without explaining.',
      'Do not rush or pressure me about deadlines outside agreed turnaround.',
      'Please provide clear and complete references — blurry or vague refs may delay work.',
      'Be respectful and patient. Rude clients will be blocked without refund.',
      'I may post the finished artwork as part of my portfolio unless NDA is agreed.',
      'AI-generated references are acceptable for mood boards, but will not be replicated.',
      'I do not draw: NSFW minors, real person fan art (without explicit consent), extreme gore.',
    ],
  },
  {
    id: '03',
    title: 'Commission Process',
    items: [
      'Fill in the order form or contact me via the listed platforms.',
      'Wait for confirmation — I will review and reply within 1–3 business days.',
      'Upon acceptance, a 50% downpayment is required before I start.',
      'I will share WIP sketches for approval before proceeding to lineart and color.',
      'Revisions are allowed at sketch stage (up to 2 rounds). Post-lineart revisions cost extra.',
      'Final file is delivered after full payment is received.',
      'Estimated turnaround: 1–3 weeks depending on complexity and queue.',
    ],
  },
  {
    id: '04',
    title: 'Copyright & Credit',
    items: [
      'I retain full artistic copyright of all created works.',
      'You may use the artwork for agreed purposes (see Commercial Tier).',
      'Credit me (@Mittsunee) whenever you post the artwork publicly.',
      'Do not claim the art as your own creation.',
      'Do not alter, crop out, or remove my watermark/signature without permission.',
      'NDA clients: usage remains restricted per our agreement. Reach out before sharing.',
      'Selling or reselling the raw art files is strictly prohibited.',
    ],
  },
  {
    id: '05',
    title: 'Payment, Refunds & Rush Fee',
    items: [
      'Accepted payment: PayPal (international), GoPay / DANA / BCA (Indonesia).',
      '50% downpayment required to start. Remaining 50% due before final delivery.',
      'Rush fee (delivery under 1 week): +30% of total price.',
      'Refunds before sketch: full refund (minus transfer fees).',
      'Refunds after sketch approval: 50% refund only.',
      'No refunds after lineart is completed.',
      'If I cancel the order on my end, a full refund will be issued.',
    ],
  },
]

const FILTER_TABS = [
  { id: 'all', label: 'All Works' },
  { id: 'illustration', label: 'Illustration' },
  { id: 'chibi', label: 'Chibi' },
  { id: 'live2d', label: 'Live2D' },
  { id: 'skeb', label: 'SKEB' },
]

// ─── Context ─────────────────────────────────────────────────────────────────

const CurrencyCtx = createContext<{ currency: Currency; toggle: () => void }>({
  currency: 'usd',
  toggle: () => {},
})
const useCurrency = () => useContext(CurrencyCtx)

// ─── Utilities ───────────────────────────────────────────────────────────────

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}
function formatUSD(n: number) {
  return `$${n}`
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

// ─── In-Hero Navigation (Header Navbar removed per request) ───────────────────


// ─── Hero Section ────────────────────────────────────────────────────────────

interface HeroSectionProps {
  onNavigate: (page: ActivePage) => void
}

function HeroSection({ onNavigate }: HeroSectionProps) {
  const socials = [
    { icon: Globe, label: 'VGen', href: 'https://vgen.co', color: '#74A2DD' },
    { icon: Heart, label: 'Instagram', href: 'https://instagram.com', color: '#E1306C' },
    { icon: MessageCircle, label: 'WhatsApp', href: 'https://wa.me', color: '#25D366' },
    { icon: Mail, label: 'Email', href: 'mailto:mittsunee@email.com', color: '#74A2DD' },
  ]

  const containerVariants: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  }
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  }

  return (
    <section id="hero" className="relative flex-1 flex items-center justify-center overflow-hidden px-4 sm:px-6 py-2 sm:py-4">
      {/* Decorative background orbs */}
      <div className="absolute top-12 left-1/4 w-72 h-72 md:w-96 md:h-96 rounded-full bg-sky-200/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 w-60 h-60 md:w-80 md:h-80 rounded-full bg-sky-300/15 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full grid md:grid-cols-2 gap-6 lg:gap-12 items-center my-auto">
        {/* Left: text content & in-hero navigation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-start gap-3 sm:gap-4"
        >
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2">
            <span className="tag text-xs">
              <Sparkles size={12} />
              Artist / Illustrator
            </span>
            <button
              type="button"
              onClick={() => onNavigate('pricing')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all hover:scale-105 ${
                COMMISSION_STATUS === 'open'
                  ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm'
                  : 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
              }`}
            >
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                COMMISSION_STATUS === 'open' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {COMMISSION_STATUS === 'open' ? 'Commissions OPEN' : 'Commissions CLOSED'}
            </button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <img
              src="/Type%20Logo.png"
              alt="Mittsunee"
              className="h-12 sm:h-16 w-auto object-contain"
            />
          </motion.div>

          <motion.p variants={itemVariants} className="text-sky-500/80 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
            Hello! I'm Mittsunee — an illustrator specialising in{' '}
            <span className="text-sky-400 font-semibold">character art</span>,{' '}
            <span className="text-sky-400 font-semibold">chibi</span>, and{' '}
            <span className="text-sky-400 font-semibold">Live2D models</span>.
            Welcome to my commission space! ✨
          </motion.p>

          {/* In-Hero Navigation Buttons */}
          <motion.div variants={itemVariants} className="w-full max-w-lg space-y-2 pt-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                <Sparkles size={11} /> Menu Halaman
              </span>
              <div className="h-px bg-sky-200/50 flex-1" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                {
                  id: 'portfolio' as const,
                  title: 'Portfolio',
                  desc: 'Gallery Karya',
                  icon: Palette,
                },
                {
                  id: 'pricing' as const,
                  title: 'Commission',
                  desc: 'Daftar Harga',
                  icon: Coins,
                },
                {
                  id: 'tos' as const,
                  title: 'Terms',
                  desc: 'Ketentuan',
                  icon: FileText,
                },
                {
                  id: 'contact' as const,
                  title: 'Contact',
                  desc: 'Pemesanan',
                  icon: MessageCircle,
                },
              ].map(item => (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="group flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl bg-white/90 hover:bg-sky-50 border border-sky-100 hover:border-sky-300 shadow-sm hover:shadow transition-all text-center cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-sky-50 group-hover:bg-sky-100/90 flex items-center justify-center text-sky-400 group-hover:text-sky-500 mb-1 transition-colors group-hover:scale-105">
                    <item.icon size={16} />
                  </div>
                  <span className="text-xs font-bold text-sky-600 group-hover:text-sky-700 leading-tight">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-sky-400 font-medium">
                    {item.desc}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Action Row: Primary VGen Order + Social Links */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 pt-0.5">
            <a href="https://vgen.co" target="_blank" rel="noreferrer" className="btn-primary !py-2 !px-4 text-xs sm:text-sm">
              <ShoppingCart size={14} />
              Order via VGen
            </a>

            <div className="flex items-center gap-1.5">
              {socials.map(s => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  title={s.label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-full card flex items-center justify-center text-sky-400 hover:text-sky-500 transition-colors"
                >
                  <s.icon size={15} />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Character art */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="relative flex justify-center items-end"
        >
          {/* Decorative ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-60 h-60 md:w-80 md:h-80 rounded-full border-2 border-dashed border-sky-200/50" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-sky-100/40" />
          </div>

          <motion.img
            src="/Original%20Character.png"
            alt="Mittsunee Original Character"
            className="relative z-10 w-full max-w-[210px] sm:max-w-xs md:max-w-sm max-h-[30vh] sm:max-h-[38vh] md:max-h-[48vh] object-contain drop-shadow-xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          />

          {/* Floating badges */}
          <motion.button
            type="button"
            onClick={() => onNavigate('pricing')}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
            className="absolute top-4 -left-2 md:left-4 card px-2.5 py-1.5 text-[11px] font-semibold text-sky-500 cursor-pointer shadow-sm"
          >
            <span className="flex items-center gap-1.5"><Star size={11} fill="currentColor" /> Chibi Available</span>
          </motion.button>
          <motion.button
            type="button"
            onClick={() => onNavigate('portfolio')}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
            className="absolute bottom-6 -right-2 md:right-4 card px-2.5 py-1.5 text-[11px] font-semibold text-sky-500 cursor-pointer shadow-sm"
          >
            <span className="flex items-center gap-1.5">🎭 Live2D Rigging</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Portfolio Section ────────────────────────────────────────────────────────

interface LightboxProps {
  items: PortfolioItem[]
  initialIndex: number
  onClose: () => void
}

function Lightbox({ items, initialIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex)
  const item = items[current]

  const prev = useCallback(() => setCurrent(i => (i - 1 + items.length) % items.length), [items.length])
  const next = useCallback(() => setCurrent(i => (i + 1) % items.length), [items.length])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', fn)
      document.body.style.overflow = ''
    }
  }, [onClose, prev, next])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(20, 40, 80, 0.8)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      {/* Image card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full"
        onClick={e => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={item.id}
            src={item.image}
            alt={item.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full object-cover max-h-[70vh]"
          />
        </AnimatePresence>

        {/* Info bar */}
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-sky-600 text-sm">{item.title}</p>
            <p className="text-sky-400 text-xs">{item.subtitle}</p>
          </div>
          <span className="tag text-xs capitalize">{item.category}</span>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-sky-400 hover:text-sky-600 hover:bg-white shadow transition-colors"
        >
          <X size={16} />
        </button>

        {/* Prev / Next */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-sky-400 hover:text-sky-600 shadow transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-sky-400 hover:text-sky-600 shadow transition-colors"
        >
          <ChevronRight size={18} />
        </button>

        {/* Counter */}
        <div className="absolute bottom-16 right-4 text-xs text-sky-300">
          {current + 1} / {items.length}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Portfolio Overall Loader Animation ─────────────────────────────────────

function PortfolioOverallLoader() {
  return (
    <div className="py-20 sm:py-28 flex flex-col items-center justify-center text-center px-4">
      {/* Animated glowing orb with Mittsunee mascot & sparkles */}
      <div className="relative mb-6">
        {/* Outer glowing pulsing halo */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-4 rounded-full bg-sky-200/60 blur-md"
        />
        {/* Spinning decorative ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-2.5 rounded-full border-2 border-dashed border-sky-300"
        />
        {/* Center avatar/mascot */}
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-lg bg-sky-100 flex items-center justify-center">
          <img
            src="/Original Character.png"
            alt="Mittsunee Mascot"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Floating sparkle badge */}
        <motion.div
          animate={{ y: [-3, 3, -3], rotate: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-amber-300 text-white flex items-center justify-center shadow-xs text-xs font-bold"
        >
          ✦
        </motion.div>
      </div>

      {/* Loading title & subtitle */}
      <motion.h3
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-base font-bold text-sky-950 font-display tracking-wide"
      >
        Menyiapkan Galeri Karya Mittsunee
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-xs text-sky-400 mt-1 max-w-xs"
      >
        Mengambil koleksi artwork terbaik...
      </motion.p>

      {/* Sleek shimmer loading bar */}
      <div className="w-48 h-1.5 bg-sky-100 rounded-full mt-4 overflow-hidden relative">
        <motion.div
          animate={{ x: [-120, 200] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-full bg-gradient-to-r from-transparent via-sky-400 to-transparent rounded-full"
        />
      </div>
    </div>
  )
}

// ─── Portfolio Card with Image Skeleton Loading ─────────────────────────────

function PortfolioCard({
  item,
  onClick,
}: {
  item: PortfolioItem
  onClick: () => void
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group relative card overflow-hidden cursor-pointer bg-white border border-sky-100/90 shadow-xs hover:shadow-md transition-all flex flex-col"
      onClick={onClick}
      whileHover={{ y: -4 }}
    >
      {/* Consistent 3:4 Aspect Ratio Frame */}
      <div className="relative w-full aspect-3/4 overflow-hidden bg-sky-50 flex items-center justify-center">
        {/* Animated Skeleton Shimmer until image is loaded */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-r from-sky-100/70 via-white/80 to-sky-100/70 animate-shimmer">
            <div className="w-10 h-10 rounded-full bg-sky-200/50 flex items-center justify-center text-sky-400 animate-pulse">
              <Sparkles size={18} />
            </div>
            <span className="text-[10px] font-semibold text-sky-400 mt-2 animate-pulse tracking-wide">
              Memuat gambar...
            </span>
          </div>
        )}

        {hasError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-sky-300 p-4 text-center">
            <Palette size={26} />
            <span className="text-xs mt-2 text-sky-400 font-medium">Gambar tidak tersedia</span>
          </div>
        ) : (
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setHasError(true)
              setIsLoaded(true)
            }}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Hover overlay with zoom icon */}
        {isLoaded && !hasError && (
          <div className="absolute inset-0 bg-sky-600/0 group-hover:bg-sky-600/25 transition-all duration-300 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-white/95 backdrop-blur flex items-center justify-center text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
              <ZoomIn size={18} />
            </div>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-sky-950 font-bold text-sm truncate" title={item.title}>
            {item.title}
          </p>
          <p className="text-sky-400 text-xs truncate mt-0.5">{item.subtitle}</p>
        </div>
        <div className="mt-2.5 pt-2 border-t border-sky-50 flex items-center justify-between">
          <span className="tag text-[10px] capitalize py-0.5 px-2 font-semibold">
            {item.category}
          </span>
          <span className="text-[11px] text-sky-400 font-medium group-hover:text-sky-600 transition-colors">
            Lihat Karya ↗
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function PortfolioSection() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(8)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const sentinelRef = useRef<HTMLDivElement>(null)

  // Fetch from Supabase on mount
  useEffect(() => {
    let isMounted = true
    setIsInitialLoading(true)

    if (isSupabaseConfigured) {
      getPortfoliosFromDB()
        .then(dbItems => {
          if (!isMounted) return
          if (dbItems && dbItems.length > 0) {
            setItems(
              dbItems.map(d => ({
                id: d.id,
                category: d.category,
                title: d.title,
                subtitle: d.subtitle,
                image: d.image_url,
              }))
            )
          }
        })
        .catch(err => {
          console.error('Failed to load portfolio from Supabase:', err)
        })
        .finally(() => {
          // Subtle natural delay to ensure titles & cards reveal smoothly without flickering
          setTimeout(() => {
            if (isMounted) setIsInitialLoading(false)
          }, 350)
        })
    } else {
      setIsInitialLoading(false)
    }

    return () => {
      isMounted = false
    }
  }, [])

  // Filtered items
  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter)
  const displayedItems = filtered.slice(0, visibleCount)
  const hasMore = displayedItems.length < filtered.length

  // Refs to avoid stale closures in listeners
  const isLoadingMoreRef = useRef(false)
  const hasMoreRef = useRef(hasMore)
  hasMoreRef.current = hasMore

  // Reset pagination count when filter tab changes
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
    setVisibleCount(8)
    isLoadingMoreRef.current = false
    setIsLoadingMore(false)
  }

  // Load next chunk of 8 items
  const loadNextBatch = useCallback(() => {
    if (isLoadingMoreRef.current || !hasMoreRef.current) return
    isLoadingMoreRef.current = true
    setIsLoadingMore(true)

    // Smooth state update with micro-delay for clean transition
    setTimeout(() => {
      setVisibleCount(prev => prev + 8)
      setIsLoadingMore(false)
      isLoadingMoreRef.current = false
    }, 120)
  }, [])

  // Infinite Scroll targeting the closest scrollable container
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    // Find the actual scrollable container (e.g. modal body with overflow-y-auto)
    const scrollContainer = sentinel.closest('.overflow-y-auto') as HTMLElement | null

    // 1. IntersectionObserver with explicit root
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          loadNextBatch()
        }
      },
      {
        root: scrollContainer,
        rootMargin: '300px',
        threshold: 0,
      }
    )
    observer.observe(sentinel)

    // 2. Direct scroll listener on the container
    const handleContainerScroll = () => {
      if (!scrollContainer) return
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      if (scrollTop + clientHeight >= scrollHeight - 350) {
        loadNextBatch()
      }
    }

    // 3. Fallback window scroll listener
    const handleWindowScroll = () => {
      if (!sentinelRef.current) return
      const rect = sentinelRef.current.getBoundingClientRect()
      if (rect.top <= window.innerHeight + 300) {
        loadNextBatch()
      }
    }

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleContainerScroll, { passive: true })
    }
    window.addEventListener('scroll', handleWindowScroll, { passive: true, capture: true })

    return () => {
      observer.disconnect()
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleContainerScroll)
      }
      window.removeEventListener('scroll', handleWindowScroll, true)
    }
  }, [loadNextBatch, visibleCount, hasMore])

  return (
    <section id="portfolio" className="py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Step 1: Overall Section Loading Animation */}
        {isInitialLoading ? (
          <PortfolioOverallLoader />
        ) : (
          <>
            {/* Step 2: Smooth Section Title & Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-8 sm:mb-10"
            >
              <p className="text-sky-400 text-sm font-medium mb-1.5">✦ My Works</p>
              <h2 className="section-title">Portfolio Gallery</h2>
              <p className="section-subtitle mt-1.5 max-w-md mx-auto text-xs sm:text-sm">
                A glimpse into my art. Click any piece to view it in full.
              </p>
            </motion.div>

            {/* Filter tabs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-10"
            >
              {FILTER_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleFilterChange(tab.id)}
                  className={`relative px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 cursor-pointer ${
                    filter === tab.id
                      ? 'text-white'
                      : 'text-sky-400 hover:text-sky-500 hover:bg-sky-50'
                  }`}
                >
                  {filter === tab.id && (
                    <motion.div
                      layoutId="pill"
                      className="absolute inset-0 rounded-full bg-sky-300"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {tab.label}
                </button>
              ))}
            </motion.div>

            {/* Step 3: Stable, Non-Jumping Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              <AnimatePresence>
                {displayedItems.map(item => (
                  <PortfolioCard
                    key={item.id}
                    item={item}
                    onClick={() => {
                      const globalIdx = items.findIndex(p => p.id === item.id)
                      setLightboxIndex(globalIdx)
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Empty State */}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-sky-300">
                Belum ada karya di kategori ini.
              </div>
            )}

            {/* Step 4: Sentinel element for infinite scroll */}
            {hasMore && (
              <div
                ref={sentinelRef}
                className="w-full py-8 flex flex-col items-center justify-center gap-3 text-xs"
              >
                {isLoadingMore ? (
                  <div className="flex items-center gap-2.5 text-sky-500 font-medium bg-sky-50/80 px-4 py-2 rounded-full border border-sky-100 shadow-xs">
                    <div className="w-4 h-4 rounded-full border-2 border-sky-300 border-t-sky-500 animate-spin" />
                    <span>Memuat karya selanjutnya...</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => loadNextBatch()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-sky-50 text-sky-600 font-semibold text-xs border border-sky-200/90 shadow-xs hover:shadow-sm transition-all active:scale-95 cursor-pointer group"
                  >
                    <span>Muat Lebih Banyak Karya (+8)</span>
                    <span className="text-sky-400 group-hover:translate-y-0.5 transition-transform font-bold">↓</span>
                  </button>
                )}
              </div>
            )}

            {/* End of list message */}
            {!hasMore && filtered.length > 8 && (
              <div className="text-center py-10 text-xs text-sky-300 font-medium">
                ✦ Kamu telah melihat semua {filtered.length} karya di kategori ini ✦
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            items={items}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

// ─── Pricing Section ──────────────────────────────────────────────────────────

function CurrencyToggle() {
  const { currency, toggle } = useCurrency()
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full bg-sky-50 border border-sky-100">
      <button
        onClick={() => currency === 'idr' && toggle()}
        className={`relative px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
          currency === 'usd' ? 'text-white' : 'text-sky-400 hover:text-sky-500'
        }`}
      >
        {currency === 'usd' && (
          <motion.div layoutId="currency-pill" className="absolute inset-0 rounded-full bg-sky-300" style={{ zIndex: -1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
        )}
        $ USD
      </button>
      <button
        onClick={() => currency === 'usd' && toggle()}
        className={`relative px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
          currency === 'idr' ? 'text-white' : 'text-sky-400 hover:text-sky-500'
        }`}
      >
        {currency === 'idr' && (
          <motion.div layoutId="currency-pill" className="absolute inset-0 rounded-full bg-sky-300" style={{ zIndex: -1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
        )}
        Rp IDR
      </button>
    </div>
  )
}

function PriceDisplay({ usd, idr }: { usd: number; idr: number }) {
  const { currency } = useCurrency()
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={currency}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
        className="font-display text-xl text-sky-500"
      >
        {currency === 'usd' ? formatUSD(usd) : formatIDR(idr)}
      </motion.span>
    </AnimatePresence>
  )
}

function CommissionCard({ category }: { category: CommissionCategory }) {
  const { currency } = useCurrency()

  return (
    <motion.div
      variants={fadeUp}
      className="card p-6 flex flex-col gap-5"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-3xl">{category.emoji}</span>
        <div>
          <h3 className="font-display text-xl text-sky-600">{category.name}</h3>
          <p className="text-sky-400/80 text-sm leading-relaxed mt-0.5">{category.desc}</p>
        </div>
      </div>

      {category.types.map(type => (
        <div key={type.name} className="flex flex-col gap-3">
          {category.types.length > 1 && (
            <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider">{type.name}</h4>
          )}
          {type.note && (
            <p className="text-xs text-sky-300 bg-sky-50 rounded-lg px-3 py-2 leading-relaxed">{type.note}</p>
          )}

          {/* Price rows */}
          <div className="rounded-xl overflow-hidden border border-sky-100">
            {type.prices.map((row, i) => (
              <div
                key={row.shot}
                className={`flex items-center justify-between px-4 py-3 ${
                  i % 2 === 0 ? 'bg-sky-50/50' : 'bg-white'
                }`}
              >
                <span className="text-sky-600 font-medium text-sm">{row.shot}</span>
                <PriceDisplay usd={row.usd} idr={row.idr} />
              </div>
            ))}
          </div>

          {/* Add-ons */}
          {type.addons.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">Add-ons</p>
              <div className="flex flex-col gap-1.5">
                {type.addons.map(addon => (
                  <div key={addon.name} className="flex items-center justify-between text-xs">
                    <span className="text-sky-500">+ {addon.name}</span>
                    <span className="font-medium text-sky-400">
                      {addon.label
                        ? addon.label
                        : addon.usd !== undefined
                          ? currency === 'usd' ? formatUSD(addon.usd) : formatIDR(addon.idr ?? 0)
                          : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </motion.div>
  )
}

function PricingSection({ onNavigateContact }: { onNavigateContact?: () => void }) {
  const [activeTab, setActiveTab] = useState('illustration')
  const activeCategory = COMMISSION_DATA.find(c => c.id === activeTab)!

  return (
    <section id="pricing" className="py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.p variants={fadeUp} className="text-sky-400 text-sm font-medium mb-2">✦ Pricing</motion.p>
          <motion.h2 variants={fadeUp} className="section-title">Commission Prices</motion.h2>
          <motion.p variants={fadeUp} className="section-subtitle mt-2 mb-6">
            All prices are negotiable for long-term clients.
          </motion.p>
          {/* Currency toggle */}
          <motion.div variants={fadeUp} className="flex justify-center">
            <CurrencyToggle />
          </motion.div>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {COMMISSION_DATA.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeTab === cat.id
                  ? 'text-white'
                  : 'text-sky-400 hover:text-sky-500 hover:bg-sky-50'
              }`}
            >
              {activeTab === cat.id && (
                <motion.div
                  layoutId="pricing-pill"
                  className="absolute inset-0 rounded-full bg-sky-400"
                  style={{ zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span>{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Active category card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-lg mx-auto"
          >
            <CommissionCard category={activeCategory} />
          </motion.div>
        </AnimatePresence>

        {/* Order note */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-8 text-center"
        >
          <p className="text-sky-400 text-sm">
            Ready to order?{' '}
            <a href="https://vgen.co" target="_blank" rel="noreferrer" className="text-sky-500 font-semibold hover:text-sky-400 underline underline-offset-2">
              Place your order via VGen
            </a>
            {' '}or{' '}
            <button
              type="button"
              onClick={onNavigateContact}
              className="text-sky-500 font-semibold hover:text-sky-400 underline underline-offset-2 cursor-pointer"
            >
              contact me directly
            </button>.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ─── ToS Section ─────────────────────────────────────────────────────────────

function ToSAccordion({ section }: { section: ToSSection }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-6 py-4 text-left group"
      >
        <span className="font-display text-sky-200 text-lg w-8 flex-shrink-0">{section.id}</span>
        <span className="flex-1 font-semibold text-sky-600 text-base group-hover:text-sky-500 transition-colors">
          {section.title}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex-shrink-0 text-sky-300"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-1 border-t border-sky-50">
              {/* Table (for Commercial Usage) */}
              {section.table && (
                <div className="mb-4 rounded-xl overflow-hidden border border-sky-100">
                  <div className="grid grid-cols-3 text-xs font-semibold text-sky-400 bg-sky-50 px-4 py-2 gap-2">
                    <span>Tier</span>
                    <span>Usage</span>
                    <span className="text-right">Fee</span>
                  </div>
                  {section.table.map((row, i) => (
                    <div
                      key={row.tier}
                      className={`grid grid-cols-3 text-xs px-4 py-2.5 gap-2 items-center ${i % 2 === 0 ? 'bg-white' : 'bg-sky-50/50'}`}
                    >
                      <span className="font-medium text-sky-600">{row.tier}</span>
                      <span className="text-sky-400">{row.usage}</span>
                      <span className="text-right font-semibold text-sky-500">{row.fee}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Rules list */}
              <ul className="flex flex-col gap-2">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-sky-500/90">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-sky-100 flex-shrink-0 flex items-center justify-center text-sky-400 text-xs font-bold">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ToSSection() {
  return (
    <section id="tos" className="py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.p variants={fadeUp} className="text-sky-400 text-sm font-medium mb-2">✦ Rules</motion.p>
          <motion.h2 variants={fadeUp} className="section-title">Terms of Service</motion.h2>
          <motion.p variants={fadeUp} className="section-subtitle mt-2">
            Please read carefully before placing a commission.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="flex flex-col gap-3"
        >
          {TOS_DATA.map(section => (
            <motion.div key={section.id} variants={fadeUp}>
              <ToSAccordion section={section} />
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center text-sky-400 text-sm mt-8"
        >
          By commissioning me, you agree to these terms. ✦
        </motion.p>
      </div>
    </section>
  )
}

// ─── Contact / Footer Section ─────────────────────────────────────────────────

function ContactSection() {
  const contacts = [
    {
      label: 'VGen',
      description: 'Order commissions directly',
      href: 'https://vgen.co',
      icon: ShoppingCart,
      primary: true,
    },
    {
      label: 'WhatsApp',
      description: 'Chat for quick inquiries',
      href: 'https://wa.me',
      icon: MessageCircle,
      primary: false,
    },
    {
      label: 'Email',
      description: 'For formal inquiries & NDA',
      href: 'mailto:mittsunee@email.com',
      icon: Mail,
      primary: false,
    },
  ]

  const socials = [
    { label: 'Heart', href: 'https://instagram.com', icon: Heart },
    { label: 'VGen', href: 'https://vgen.co', icon: Globe },
    { label: 'Email', href: 'mailto:mittsunee@email.com', icon: Mail },
    { label: 'WhatsApp', href: 'https://wa.me', icon: MessageCircle },
  ]

  return (
    <section id="contact" className="py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.p variants={fadeUp} className="text-sky-400 text-sm font-medium mb-2">✦ Get In Touch</motion.p>
          <motion.h2 variants={fadeUp} className="section-title">Contact & Order</motion.h2>
          <motion.p variants={fadeUp} className="section-subtitle mt-2">
            Ready to commission? Here's how to reach me!
          </motion.p>
        </motion.div>

        {/* Contact cards */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid sm:grid-cols-3 gap-4 mb-12"
        >
          {contacts.map(c => (
            <motion.a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className={`card p-5 flex flex-col items-center text-center gap-3 transition-all duration-200 ${
                c.primary ? 'bg-sky-300 border-sky-300 !shadow-[0_8px_24px_rgba(116,162,221,0.4)]' : ''
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                c.primary ? 'bg-white/25 text-white' : 'bg-sky-50 text-sky-400'
              }`}>
                <c.icon size={22} />
              </div>
              <div>
                <p className={`font-semibold text-base ${c.primary ? 'text-white' : 'text-sky-600'}`}>{c.label}</p>
                <p className={`text-xs mt-0.5 ${c.primary ? 'text-white/80' : 'text-sky-400'}`}>{c.description}</p>
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${c.primary ? 'text-white/90' : 'text-sky-400'}`}>
                {c.primary ? 'Order Now' : 'Open Chat'}
                <ExternalLink size={11} />
              </span>
            </motion.a>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="divider mb-10" />

        {/* Social links row */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="flex justify-center gap-4"
        >
          {socials.map(s => (
            <motion.a
              key={s.label}
              href={s.href}
              target={s.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              title={s.label}
              variants={fadeUp}
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 rounded-full card flex items-center justify-center text-sky-400 hover:text-sky-500 transition-colors"
            >
              <s.icon size={18} />
            </motion.a>
          ))}
        </motion.div>

        {/* Credit note */}
        <div className="text-center mt-10 text-sky-300 text-xs">
          <p>Please credit <strong>@Mittsunee</strong> when sharing commissioned works.</p>
        </div>
      </div>
    </section>
  )
}

// ─── Page Overlay Card (Modal with Window Controls) ──────────────────────────

interface PageOverlayCardProps {
  activePage: ActivePage
  onClose: () => void
  onNavigate: (page: ActivePage) => void
}

function PageOverlayCard({ activePage, onClose, onNavigate }: PageOverlayCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const pagesInfo: Record<ActivePage, { title: string; subtitle: string; icon: typeof Palette }> = {
    portfolio: { title: 'Portfolio Gallery', subtitle: 'Koleksi Artwork & Model', icon: Palette },
    pricing: { title: 'Commission Prices', subtitle: 'Daftar Harga & Opsi Tambahan', icon: Coins },
    tos: { title: 'Terms of Service', subtitle: 'Syarat & Ketentuan Komisi', icon: FileText },
    contact: { title: 'Contact & Order', subtitle: 'Cara Pemesanan & Kontak', icon: MessageCircle },
  }

  const current = pagesInfo[activePage]
  const CurrentIcon = current.icon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 md:p-8 bg-sky-950/45 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 35 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 25 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        onClick={e => e.stopPropagation()}
        className={`relative w-full bg-white/95 backdrop-blur-xl shadow-2xl border border-sky-100 flex flex-col overflow-hidden transition-all duration-300 ${
          isExpanded
            ? 'max-w-[98vw] h-[97vh] rounded-2xl'
            : 'max-w-5xl max-h-[92vh] h-[88vh] rounded-3xl'
        }`}
      >
        {/* Card Header / Window Controls */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-md border-b border-sky-100/80 gap-3">
          {/* Left: Active Page Indicator & Quick Switcher Tabs */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Active Page Badge */}
            <div className="flex items-center gap-2 text-sky-600 text-xs font-semibold shrink-0">
              <span className="w-7 h-7 rounded-lg bg-sky-100/80 text-sky-500 flex items-center justify-center shadow-xs">
                <CurrentIcon size={14} />
              </span>
              <span className="hidden sm:inline font-bold tracking-wide">{current.title}</span>
            </div>

            {/* Quick Page Switcher Tabs */}
            <div className="flex items-center gap-1 bg-sky-50/80 p-1 rounded-full border border-sky-100/70">
              {[
                { id: 'portfolio' as const, label: 'Portfolio', icon: Palette },
                { id: 'pricing' as const, label: 'Commission', icon: Coins },
                { id: 'tos' as const, label: 'ToS', icon: FileText },
                { id: 'contact' as const, label: 'Contact', icon: MessageCircle },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onNavigate(tab.id)}
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activePage === tab.id
                      ? 'bg-sky-400 text-white shadow-xs'
                      : 'text-sky-500 hover:text-sky-700 hover:bg-sky-100/60'
                  }`}
                >
                  <tab.icon size={13} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Window Control Buttons (Perbesar & Silang) */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-sky-100/90 border border-sky-200/80 shadow-xs shrink-0">
            {/* Maximize/Expand button */}
            <button
              type="button"
              onClick={() => setIsExpanded(e => !e)}
              title={isExpanded ? "Ukuran Standar" : "Perbesar Penuh (Fullscreen)"}
              className="w-7 h-7 rounded-full bg-white hover:bg-sky-50 text-sky-500 hover:text-sky-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              {isExpanded ? <Minimize2 size={13} strokeWidth={2.5} /> : <Maximize2 size={13} strokeWidth={2.5} />}
            </button>
            {/* Close/Exit button */}
            <button
              type="button"
              onClick={onClose}
              title="Tutup / Exit (ESC)"
              className="w-7 h-7 rounded-full bg-white hover:bg-rose-500 text-sky-500 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs group"
            >
              <X size={14} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {activePage === 'portfolio' && <PortfolioSection />}
              {activePage === 'pricing' && <PricingSection onNavigateContact={() => onNavigate('contact')} />}
              {activePage === 'tos' && <ToSSection />}
              {activePage === 'contact' && <ContactSection />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card Footer Bar */}
        <div className="px-5 py-3 bg-sky-50/60 border-t border-sky-100 flex items-center justify-between text-xs text-sky-400">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-sky-100 border border-sky-200/60 text-sky-600 font-semibold transition-colors cursor-pointer"
          >
            <X size={13} />
            <span>Tutup & Kembali ke Beranda</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-sky-400">
            <span>Tekan <kbd className="px-1.5 py-0.5 rounded bg-white border border-sky-200 font-mono text-[10px]">ESC</kbd> untuk menutup</span>
          </div>
          <a
            href="https://vgen.co"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-400 hover:bg-sky-500 text-white font-semibold transition-all shadow-sm"
          >
            <ShoppingCart size={13} />
            <span>Order via VGen</span>
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Home Footer ─────────────────────────────────────────────────────────────

function HomeFooter() {
  return (
    <footer className="w-full py-2.5 px-6 bg-white/40 backdrop-blur-sm border-t border-sky-100/60 shrink-0 text-center select-none">
      <div className="max-w-5xl mx-auto flex items-center justify-between text-[11px] text-sky-400">
        <span>© {new Date().getFullYear()} <strong>Mittsunee</strong> — All rights reserved</span>
        <span className="hidden sm:inline text-sky-300">Illustration · Chibi · Live2D</span>
      </div>
    </footer>
  )
}

// Helper to check secret admin route (/cyela or #/cyela)
function checkIsAdminRoute(): boolean {
  if (typeof window === 'undefined') return false
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '')
  const hash = window.location.hash.toLowerCase().replace(/\/+$/, '')
  return path === '/cyela' || hash === '#/cyela' || hash === '#cyela'
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(checkIsAdminRoute)
  const [currency, setCurrency] = useState<Currency>('usd')
  const toggle = useCallback(() => setCurrency(c => c === 'usd' ? 'idr' : 'usd'), [])
  const [activePage, setActivePage] = useState<ActivePage | null>(null)

  // Listen to browser navigation / URL changes for secret /cyela route
  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdmin(checkIsAdminRoute())
    }
    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [])

  // Handle returning from Admin to public site
  const handleExitAdmin = useCallback(() => {
    window.history.pushState({}, '', '/')
    setIsAdmin(false)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePage(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Lock body scroll when card modal is open
  useEffect(() => {
    if (activePage && !isAdmin) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [activePage, isAdmin])

  // If secret route /cyela is active, show the Admin Portfolio Page
  if (isAdmin) {
    return <AdminPortfolioPage onExit={handleExitAdmin} />
  }

  return (
    <CurrencyCtx.Provider value={{ currency, toggle }}>
      <div className="h-screen h-[100dvh] overflow-hidden flex flex-col justify-between">
        <HeroSection onNavigate={setActivePage} />

        <HomeFooter />

        {/* Animated Page Overlay Card */}
        <AnimatePresence>
          {activePage && (
            <PageOverlayCard
              activePage={activePage}
              onClose={() => setActivePage(null)}
              onNavigate={setActivePage}
            />
          )}
        </AnimatePresence>
      </div>
    </CurrencyCtx.Provider>
  )
}

