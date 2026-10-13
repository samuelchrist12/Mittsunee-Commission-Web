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

export const INITIAL_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 40,
    category: 'illustration',
    title: 'Kalopsia',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/29_Kalopsia.webp',
  },
  {
    id: 39,
    category: 'illustration',
    title: 'Mayse',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/28_Mayse.webp',
  },
  {
    id: 38,
    category: 'illustration',
    title: 'Njess',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/27_njess.webp',
  },
  {
    id: 36,
    category: 'illustration',
    title: 'Fania',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/26_Fania.webp',
  },
  {
    id: 35,
    category: 'illustration',
    title: 'Aoki Ryuzen',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/25_aoki_ryuzen.webp',
  },
  {
    id: 34,
    category: 'illustration',
    title: 'Futsuri',
    subtitle: 'Original Character',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/24_Futsuri.webp',
  },
  {
    id: 33,
    category: 'illustration',
    title: 'Fuyo Mafuyu',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/23_Fuyo_Mafuyu.webp',
  },
  {
    id: 32,
    category: 'illustration',
    title: 'Yuki Setsuna',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/22_Yuki_setsuna.webp',
  },
  {
    id: 31,
    category: 'illustration',
    title: 'Hatsune Miku',
    subtitle: 'Fanart Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/21_Miku.webp',
  },
  {
    id: 30,
    category: 'illustration',
    title: 'Original Character Portrait',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/20_OC.webp',
  },
  {
    id: 29,
    category: 'illustration',
    title: 'Furina',
    subtitle: 'Fanart Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/19_Fanart_furina.webp',
  },
  {
    id: 28,
    category: 'illustration',
    title: 'Artwork #18',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/18.webp',
  },
  {
    id: 27,
    category: 'illustration',
    title: 'Njess',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/17_Njess.webp',
  },
  {
    id: 26,
    category: 'illustration',
    title: 'Oxy',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/16_Oxy_.webp',
  },
  {
    id: 25,
    category: 'illustration',
    title: 'Forever Young',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/15_Forever_young.webp',
  },
  {
    id: 24,
    category: 'chibi',
    title: 'Kurumi Tokisaki',
    subtitle: 'Chibi Character Art',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/14_Chibi_tokisaki.webp',
  },
  {
    id: 23,
    category: 'illustration',
    title: 'Amyllis',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/13_Amyllis.webp',
  },
  {
    id: 22,
    category: 'illustration',
    title: 'Harumika',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/12_Harumika.webp',
  },
  {
    id: 21,
    category: 'illustration',
    title: 'Aoki Ryuzen',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/11_Aoki_Ryuzen.webp',
  },
  {
    id: 20,
    category: 'illustration',
    title: 'Aislyn Bloomtear',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/10_Aislyn_bloomtear.webp',
  },
  {
    id: 19,
    category: 'illustration',
    title: 'Dakung',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/09_Dakung.webp',
  },
  {
    id: 18,
    category: 'illustration',
    title: 'Lucia Seraphina',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/08_Lucia_seraphina.webp',
  },
  {
    id: 17,
    category: 'illustration',
    title: 'Runa',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/07_Runa.webp',
  },
  {
    id: 16,
    category: 'chibi',
    title: 'Kuma Kumarin',
    subtitle: 'Chibi Character Art',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/06_Kuma_kumarin.webp',
  },
  {
    id: 15,
    category: 'illustration',
    title: 'Fuyu Sierra',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/05_Fuyu_sierra.webp',
  },
  {
    id: 14,
    category: 'illustration',
    title: 'Aru',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/04_Aru.webp',
  },
  {
    id: 13,
    category: 'illustration',
    title: 'Mitsuyama Haruka',
    subtitle: 'Full Illustration',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/03_Mitsuyama_haruka.webp',
  },
  {
    id: 12,
    category: 'illustration',
    title: 'Futsuri (Black Ver.)',
    subtitle: 'Original Character',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/02_Futsuri_black.webp',
  },
  {
    id: 11,
    category: 'illustration',
    title: 'Futsuri',
    subtitle: 'Original Character',
    image: 'https://udilgelagkmivkdiaqyt.supabase.co/storage/v1/object/public/portfolio/artworks/01_Futsuri.webp',
  },
]

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
    desc: 'Detailed character illustrations with clean lines and vibrant coloring.',
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
          { name: 'Additional Character', label: '+100% base price' },
          { name: 'Simple Background', label: 'Free' },
          { name: 'Complex Background', label: '+50% base price' },
          { name: 'Detailed Props / Accessories', label: '+10% to 20%' },
        ],
      },
    ],
  },
  {
    id: 'chibi',
    name: 'Chibi',
    emoji: '🌸',
    desc: 'Expressive chibi characters, suited for stickers, emotes, and avatars.',
    types: [
      {
        name: 'Chibi Style',
        prices: [
          { shot: 'Head Shot', usd: 15, idr: 70_000 },
          { shot: 'Full Body', usd: 25, idr: 95_000 },
        ],
        addons: [
          { name: 'Additional Character', label: '+100% base price' },
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
    desc: 'Surprise commissions where pose, expression, and composition are left to the artist.',
    types: [
      {
        name: 'Surprise Commission (SKEB)',
        note: 'Concept and composition are decided by the artist. Design revisions are not included.',
        prices: [
          { shot: 'Bust Up', usd: 70, idr: 85_000 },
        ],
        addons: [
          { name: 'Background', label: 'Artist choice' },
        ],
      },
    ],
  },
  {
    id: 'live2d',
    name: 'Live2D',
    emoji: '🎭',
    desc: 'Layer-separated and rigged Live2D VTuber models ready for tracking software.',
    types: [
      {
        name: 'Full Body Live2D Model',
        note: 'Tier 1: standard rig | Tier 2: physics and expressions | Tier 3: full model package',
        prices: [
          { shot: 'Tier 1', usd: 300, idr: 1_000_000 },
          { shot: 'Tier 2', usd: 550, idr: 2_500_000 },
          { shot: 'Tier 3', usd: 750, idr: 4_500_000 },
        ],
        addons: [
          { name: 'Character Design by Artist', usd: 150, idr: 250_000 },
          { name: 'Dynamic Action Pose', usd: 200, idr: 700_000 },
          { name: 'Alternate Outfit', usd: 150, idr: 150_000 },
          { name: 'Alternate Hairstyle', usd: 150, idr: 150_000 },
          { name: 'Pet or Prop Item', usd: 150, idr: 150_000 },
          { name: 'Articulated Fingers', usd: 150, idr: 150_000 },
          { name: 'Furry Character Feature', usd: 150, idr: 150_000 },
          { name: 'Hand Pose Toggle', usd: 150, idr: 150_000 },
          { name: 'Base Body Model', usd: 150, idr: 150_000 },
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
      { tier: 'Tier 0: Personal', usage: 'Private use, wallpapers, non-monetized avatars', fee: 'Included' },
      { tier: 'Tier 1: Streaming', usage: 'VTubing and streaming channels under 10k followers', fee: '+10%' },
      { tier: 'Tier 2: Creator', usage: 'Monetized content, YouTube videos, small merchandise', fee: '+25%' },
      { tier: 'Tier 3: Commercial', usage: 'Company branding, advertising, large merchandise runs', fee: '+50%' },
    ],
    items: [
      'Orders default to Tier 0 (Personal Use).',
      'Please state any commercial intentions when sending your inquiry.',
      'Usage rights can be upgraded at a later date with an adjusted fee.',
    ],
  },
  {
    id: '02',
    title: 'General Guidelines',
    items: [
      'I reserve the right to decline commissions that do not align with my style.',
      'Please do not push for rush turnarounds outside agreed milestones.',
      'Clear references help avoid misunderstandings and delays.',
      'Communication should remain respectful. Harassment will lead to immediate cancellation.',
      'Finished pieces may be featured in my public portfolio unless an NDA was agreed upon.',
      'AI images can be shared as visual mood references, but will not be directly copied.',
      'I do not accept: explicit minor NSFW, non-consensual real person art, or extreme gore.',
    ],
  },
  {
    id: '03',
    title: 'Workflow & Revisions',
    items: [
      'Submit your request through VGen or the direct inquiry channels below.',
      'I review each request and reply within 1 to 3 business days.',
      'A 50% deposit is required before work starts on the initial sketch.',
      'Rough sketches will be shared for feedback before lineart and coloring.',
      'Two revision rounds are included at the sketch phase. Edits after lineart incur extra fees.',
      'Full-resolution art files are delivered once the remaining balance is settled.',
      'Estimated turnaround is 1 to 3 weeks depending on queue position and complexity.',
    ],
  },
  {
    id: '04',
    title: 'Copyright & Attribution',
    items: [
      'The artist retains intellectual property and copyright over the artwork.',
      'You receive license rights corresponding to your selected usage tier.',
      'Please credit @Mittsunee whenever posting or showcasing the artwork.',
      'Do not claim the illustration as your own creation.',
      'Do not crop, remove, or obscure the artist watermark without written agreement.',
      'Reselling raw project files or minting the art as NFTs is strictly prohibited.',
    ],
  },
  {
    id: '05',
    title: 'Payments, Refunds & Rush Orders',
    items: [
      'Accepted payment options: PayPal (international) and GoPay, DANA, or BCA (Indonesia).',
      'A 50% deposit is required to begin. The final 50% is due upon completion.',
      'Rush orders (completed within 7 days): +30% of the total quote.',
      'Cancellations before sketching starts receive a full refund minus transfer fees.',
      'Cancellations during the sketch phase qualify for a 50% refund.',
      'No refunds are available once lineart has started.',
      'A full refund will be provided if a commission is cancelled on my end.',
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
    <section id="hero" className="relative flex-1 flex items-center justify-center overflow-hidden px-3 sm:px-6 py-1 sm:py-4">
      {/* Decorative background orbs */}
      <div className="absolute top-12 left-1/4 w-72 h-72 md:w-96 md:h-96 rounded-full bg-sky-200/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 w-60 h-60 md:w-80 md:h-80 rounded-full bg-sky-300/15 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full grid md:grid-cols-2 gap-3 sm:gap-6 lg:gap-12 items-center my-auto">
        {/* Left: text content & in-hero navigation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center md:items-start text-center md:text-left gap-2 sm:gap-3 md:gap-4 w-full"
        >
          {/* Status Badges */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2">
            <span className="tag text-[10px] sm:text-xs py-0.5 px-2.5">
              <Sparkles size={11} />
              Artist / Illustrator
            </span>
            <button
              type="button"
              onClick={() => onNavigate('pricing')}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold cursor-pointer transition-all hover:scale-105 ${
                COMMISSION_STATUS === 'open'
                  ? 'bg-green-50 text-green-700 border border-green-200 shadow-2xs'
                  : 'bg-red-50 text-red-700 border border-red-200 shadow-2xs'
              }`}
            >
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse ${
                COMMISSION_STATUS === 'open' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {COMMISSION_STATUS === 'open' ? 'Commissions OPEN' : 'Commissions CLOSED'}
            </button>
          </motion.div>

          {/* Mittsunee Logo */}
          <motion.div variants={itemVariants} className="flex justify-center md:justify-start">
            <img
              src="/Type%20Logo.png"
              alt="Mittsunee"
              className="h-8 sm:h-11 md:h-16 w-auto object-contain select-none"
            />
          </motion.div>

          {/* Mobile Character Art (shown only on mobile < md to keep viewport compact and balanced) */}
          <div className="md:hidden relative flex justify-center items-center my-0.5">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-28 h-28 rounded-full border border-dashed border-sky-200/50" />
              <div className="w-20 h-20 rounded-full bg-sky-100/40 absolute" />
            </div>
            <motion.img
              src="/Original%20Character.png"
              alt="Mittsunee Original Character"
              className="relative z-10 w-full max-w-[130px] max-h-[19vh] object-contain drop-shadow-md select-none"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            />
            {/* Floating chips on mobile */}
            <button
              type="button"
              onClick={() => onNavigate('pricing')}
              className="absolute top-1 -left-2 card px-2 py-0.5 text-[9px] font-semibold text-sky-500 shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <Star size={9} fill="currentColor" /> Chibi
            </button>
            <button
              type="button"
              onClick={() => onNavigate('portfolio')}
              className="absolute bottom-1 -right-2 card px-2 py-0.5 text-[9px] font-semibold text-sky-500 shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              Live2D
            </button>
          </div>

          {/* Bio text */}
          <motion.p variants={itemVariants} className="text-sky-500/80 text-[11px] sm:text-xs md:text-base leading-snug sm:leading-relaxed max-w-xs md:max-w-md">
            Hello! I'm Mittsunee, an illustrator specializing in{' '}
            <span className="text-sky-400 font-semibold">character art</span>,{' '}
            <span className="text-sky-400 font-semibold">chibi</span>, and{' '}
            <span className="text-sky-400 font-semibold">Live2D models</span>.
            Welcome to my commission portfolio! ✨
          </motion.p>

          {/* In-Hero Navigation Buttons */}
          <motion.div variants={itemVariants} className="w-full max-w-sm md:max-w-lg space-y-1 sm:space-y-2 pt-0.5">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                <Sparkles size={10} /> Quick Navigation
              </span>
              <div className="h-px bg-sky-200/50 flex-1 hidden md:block" />
            </div>

            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {[
                {
                  id: 'portfolio' as const,
                  title: 'Portfolio',
                  desc: 'Art Gallery',
                  icon: Palette,
                },
                {
                  id: 'pricing' as const,
                  title: 'Commission',
                  desc: 'Price Tiers',
                  icon: Coins,
                },
                {
                  id: 'tos' as const,
                  title: 'Terms',
                  desc: 'Guidelines',
                  icon: FileText,
                },
                {
                  id: 'contact' as const,
                  title: 'Contact',
                  desc: 'Order & Links',
                  icon: MessageCircle,
                },
              ].map(item => (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="group flex flex-col items-center justify-center p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/90 hover:bg-sky-50 border border-sky-100 hover:border-sky-300 shadow-2xs hover:shadow-xs transition-all text-center cursor-pointer"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-sky-50 group-hover:bg-sky-100/90 flex items-center justify-center text-sky-400 group-hover:text-sky-500 mb-0.5 sm:mb-1 transition-colors group-hover:scale-105">
                    <item.icon size={14} className="sm:hidden" />
                    <item.icon size={16} className="hidden sm:block" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-sky-600 group-hover:text-sky-700 leading-tight">
                    {item.title}
                  </span>
                  <span className="hidden sm:block text-[10px] text-sky-400 font-medium">
                    {item.desc}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Action Row: Primary VGen Order + Social Links */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 pt-0.5">
            <a href="https://vgen.co" target="_blank" rel="noreferrer" className="btn-primary !py-1.5 !px-3 sm:!py-2 sm:!px-4 text-xs sm:text-sm">
              <ShoppingCart size={13} />
              Order via VGen
            </a>

            <div className="flex items-center gap-1 sm:gap-1.5">
              {socials.map(s => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  title={s.label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full card flex items-center justify-center text-sky-400 hover:text-sky-500 transition-colors shadow-2xs"
                >
                  <s.icon size={13} className="sm:hidden" />
                  <s.icon size={15} className="hidden sm:block" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Character art for desktop */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="hidden md:flex relative justify-center items-end"
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
            className="relative z-10 w-full max-w-[210px] sm:max-w-xs md:max-w-sm max-h-[30vh] sm:max-h-[38vh] md:max-h-[48vh] object-contain drop-shadow-xl select-none"
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
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(12, 28, 56, 0.82)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      {/* Image card modal */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl max-h-[92vh] w-full flex flex-col border border-sky-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Main Artwork Preview Frame */}
        <div className="relative flex-1 min-h-0 flex items-center justify-center bg-sky-50/60 p-3 sm:p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={item.id}
              src={item.image}
              alt={item.title}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              className="max-h-[70vh] sm:max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-xs select-none"
            />
          </AnimatePresence>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            title="Close Preview (ESC)"
            className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/95 hover:bg-rose-500 text-sky-600 hover:text-white backdrop-blur shadow-md flex items-center justify-center transition-all cursor-pointer group"
          >
            <X size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
          </button>

          {/* Prev / Next navigation buttons */}
          <button
            type="button"
            onClick={prev}
            title="Previous Artwork (Left Arrow)"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-sky-600 hover:text-sky-800 backdrop-blur shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={next}
            title="Next Artwork (Right Arrow)"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-sky-600 hover:text-sky-800 backdrop-blur shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Info bar footer */}
        <div className="px-5 py-3.5 bg-white border-t border-sky-100 flex items-center justify-between shrink-0">
          <div className="min-w-0 pr-3">
            <p className="font-bold text-sky-950 text-sm truncate" title={item.title}>
              {item.title}
            </p>
            <p className="text-sky-400 text-xs truncate mt-0.5">{item.subtitle}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-sky-400 font-medium">
              {current + 1} / {items.length}
            </span>
            <span className="tag text-[11px] capitalize px-2.5 py-0.5 font-semibold">
              {item.category}
            </span>
          </div>
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
        Loading Gallery Artworks
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-xs text-sky-400 mt-1 max-w-xs"
      >
        Fetching recent illustrations and models...
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

// ─── Ultra-Lightweight Portfolio Card with Fast CDN Thumbnails ──────────────

function PortfolioCard({
  item,
  index = 0,
  onClick,
}: {
  item: PortfolioItem
  index?: number
  onClick: () => void
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Immediately reveal if image is already cached by the browser
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true)
    }
  }, [item.image])

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: Math.min((index % 6) * 0.07, 0.35),
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={onClick}
      className="group relative card overflow-hidden cursor-pointer bg-white border border-sky-100/90 shadow-2xs hover:shadow-md transition-transform duration-200 hover:-translate-y-1.5 will-change-transform flex flex-col"
    >
      {/* Proportionate Aspect Ratio Frame */}
      <div className="relative w-full aspect-square overflow-hidden bg-sky-50/70 flex items-center justify-center p-1 sm:p-2">
        {/* Lightweight Skeleton until image is loaded */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-sky-50/90 animate-pulse pointer-events-none p-2 text-center">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-sky-200/50 flex items-center justify-center text-sky-400">
              <Sparkles size={14} className="sm:hidden" />
              <Sparkles size={18} className="hidden sm:block" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-semibold text-sky-400 mt-1.5 tracking-wide">
              Loading artwork...
            </span>
          </div>
        )}

        {hasError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-sky-300 p-2 text-center">
            <Palette size={20} className="sm:hidden" />
            <Palette size={26} className="hidden sm:block" />
            <span className="text-[10px] sm:text-xs mt-1 text-sky-400 font-medium">Artwork preview unavailable</span>
          </div>
        ) : (
          <img
            ref={imgRef}
            src={item.image}
            alt={item.title}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setHasError(true)
              setIsLoaded(true)
            }}
            className={`w-full h-full object-contain rounded-lg sm:rounded-xl transition-transform duration-300 group-hover:scale-105 will-change-transform ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Hover overlay with zoom icon */}
        {isLoaded && !hasError && (
          <div className="absolute inset-0 bg-sky-950/0 group-hover:bg-sky-950/15 transition-colors duration-200 flex items-center justify-center pointer-events-none rounded-xl sm:rounded-2xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 shadow-md flex items-center justify-center text-sky-600 scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <ZoomIn size={15} className="sm:hidden" />
              <ZoomIn size={18} className="hidden sm:block" />
            </div>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-2 sm:p-3 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-sky-950 font-bold text-xs sm:text-sm truncate" title={item.title}>
            {item.title}
          </p>
          <p className="text-sky-400 text-[10px] sm:text-xs truncate mt-0.5">{item.subtitle}</p>
        </div>
        <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-sky-50 flex items-center justify-between">
          <span className="tag text-[9px] sm:text-[10px] capitalize py-0.5 px-1.5 sm:px-2 font-semibold">
            {item.category}
          </span>
          <span className="text-[9px] sm:text-[11px] text-sky-400 font-medium group-hover:text-sky-600 transition-colors">
            View Piece ↗
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function PortfolioSection() {
  const [items, setItems] = useState<PortfolioItem[]>(INITIAL_PORTFOLIO_ITEMS)
  const isInitialLoading = items.length === 0
  const [filter, setFilter] = useState('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(6)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const sectionRef = useRef<HTMLElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Background sync from Supabase to pick up any new admin uploads
  useEffect(() => {
    let isMounted = true

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
          console.error('Failed to sync portfolios from Supabase:', err)
        })
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
    setVisibleCount(6)
    isLoadingMoreRef.current = false
    setIsLoadingMore(false)
  }

  // Load next chunk of 6 items automatically on scroll
  const loadNextBatch = useCallback(() => {
    if (isLoadingMoreRef.current || !hasMoreRef.current) return
    isLoadingMoreRef.current = true
    setIsLoadingMore(true)

    setTimeout(() => {
      setVisibleCount(prev => prev + 6)
      setIsLoadingMore(false)
      isLoadingMoreRef.current = false
    }, 180)
  }, [])

  // Auto-trigger infinite scroll on container scroll, IntersectionObserver, and window scroll
  useEffect(() => {
    const sectionEl = sectionRef.current
    const scrollContainer =
      (sectionEl?.closest('.overflow-y-auto') as HTMLElement | null) ||
      (document.querySelector('.overflow-y-auto') as HTMLElement | null)

    // 1. Direct container scroll listener (triggers within 320px of bottom)
    const handleContainerScroll = () => {
      if (!scrollContainer) return
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      if (scrollTop + clientHeight >= scrollHeight - 320) {
        loadNextBatch()
      }
    }

    // 2. IntersectionObserver on sentinel
    let observer: IntersectionObserver | null = null
    const sentinel = sentinelRef.current
    if (sentinel) {
      observer = new IntersectionObserver(
        entries => {
          if (entries[0]?.isIntersecting) {
            loadNextBatch()
          }
        },
        {
          root: scrollContainer || null,
          rootMargin: '250px 0px',
          threshold: 0,
        }
      )
      observer.observe(sentinel)
    }

    // 3. Fallback window scroll listener
    const handleWindowScroll = () => {
      const target = sentinelRef.current || sectionRef.current
      if (!target) return
      const rect = target.getBoundingClientRect()
      if (rect.top <= window.innerHeight + 320) {
        loadNextBatch()
      }
    }

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleContainerScroll, { passive: true })
    }
    window.addEventListener('scroll', handleWindowScroll, { passive: true })

    return () => {
      if (observer) observer.disconnect()
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleContainerScroll)
      }
      window.removeEventListener('scroll', handleWindowScroll)
    }
  }, [loadNextBatch, visibleCount, hasMore, filter])

  return (
    <section ref={sectionRef} id="portfolio" className="py-4 sm:py-10 px-2 sm:px-6">
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
              className="text-center mb-4 sm:mb-10"
            >
              <p className="text-sky-400 text-xs sm:text-sm font-medium mb-1">✦ My Works</p>
              <h2 className="section-title text-xl sm:text-3xl">Portfolio Gallery</h2>
              <p className="section-subtitle mt-1 max-w-md mx-auto text-[11px] sm:text-sm">
                A glimpse into my art. Click any piece to view it in full.
              </p>
            </motion.div>

            {/* Filter tabs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-10"
            >
              {FILTER_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleFilterChange(tab.id)}
                  className={`relative px-3 sm:px-5 py-1 sm:py-2 rounded-full text-[11px] sm:text-sm font-medium transition-colors duration-200 cursor-pointer ${
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

            {/* Step 3: Fast, Stable, Hardware-Accelerated Responsive Grid (2 columns on mobile) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-5">
              {displayedItems.map((item, index) => (
                <PortfolioCard
                  key={item.id}
                  item={item}
                  index={index}
                  onClick={() => {
                    const globalIdx = items.findIndex(p => p.id === item.id)
                    setLightboxIndex(globalIdx)
                  }}
                />
              ))}
            </div>

            {/* Empty State */}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-sky-300 text-xs sm:text-sm">
                No artworks found in this category.
              </div>
            )}

            {/* Step 4: Automatic Sentinel element for seamless infinite scroll (No button) */}
            {hasMore && (
              <div
                ref={sentinelRef}
                className="w-full py-4 sm:py-6 flex items-center justify-center text-xs"
              >
                {isLoadingMore ? (
                  <div className="flex items-center gap-2.5 text-sky-500 font-medium bg-sky-50/90 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-sky-100 shadow-xs animate-pulse text-xs">
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-sky-300 border-t-sky-500 animate-spin" />
                    <span>Loading more artworks...</span>
                  </div>
                ) : (
                  <div className="h-4 w-full" />
                )}
              </div>
            )}

            {/* End of list message */}
            {!hasMore && filtered.length > 6 && (
              <div className="text-center py-8 text-xs text-sky-300 font-medium">
                ✦ You have viewed all {filtered.length} artworks in this category ✦
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
                          : '-'}
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
    portfolio: { title: 'Portfolio Gallery', subtitle: 'Illustrations and Live2D Artworks', icon: Palette },
    pricing: { title: 'Commission Prices', subtitle: 'Rates and Options', icon: Coins },
    tos: { title: 'Terms of Service', subtitle: 'Guidelines and Revisions', icon: FileText },
    contact: { title: 'Contact & Order', subtitle: 'Direct Links and Order Form', icon: MessageCircle },
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
      className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-5 md:p-8 bg-sky-950/45 backdrop-blur-md"
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
            : 'max-w-5xl max-h-[96vh] h-[93vh] sm:max-h-[92vh] sm:h-[88vh] rounded-2xl sm:rounded-3xl'
        }`}
      >
        {/* Card Header / Window Controls */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-white/95 backdrop-blur-md border-b border-sky-100/80 gap-2 sm:gap-3">
          {/* Left: Active Page Indicator & Quick Switcher Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-4 min-w-0">
            {/* Active Page Badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-sky-600 text-xs font-semibold shrink-0">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-sky-100/80 text-sky-500 flex items-center justify-center shadow-xs">
                <CurrentIcon size={13} />
              </span>
              <span className="hidden sm:inline font-bold tracking-wide">{current.title}</span>
            </div>

            {/* Quick Page Switcher Tabs */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-sky-50/80 p-0.5 sm:p-1 rounded-full border border-sky-100/70">
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
                  className={`px-2 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                    activePage === tab.id
                      ? 'bg-sky-400 text-white shadow-xs'
                      : 'text-sky-500 hover:text-sky-700 hover:bg-sky-100/60'
                  }`}
                >
                  <tab.icon size={12} className="sm:size-[13px]" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Window Control Buttons (Maximize & Close) */}
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-full bg-sky-100/90 border border-sky-200/80 shadow-xs shrink-0">
            {/* Maximize/Expand button */}
            <button
              type="button"
              onClick={() => setIsExpanded(e => !e)}
              title={isExpanded ? "Standard Window" : "Expand Fullscreen"}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white hover:bg-sky-50 text-sky-500 hover:text-sky-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              {isExpanded ? <Minimize2 size={12} strokeWidth={2.5} /> : <Maximize2 size={12} strokeWidth={2.5} />}
            </button>
            {/* Close/Exit button */}
            <button
              type="button"
              onClick={onClose}
              title="Close Window (ESC)"
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white hover:bg-rose-500 text-sky-500 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs group"
            >
              <X size={13} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
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
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-sky-50/60 border-t border-sky-100 flex items-center justify-between text-xs text-sky-400 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white hover:bg-sky-100 border border-sky-200/60 text-sky-600 font-semibold transition-colors cursor-pointer text-[11px] sm:text-xs"
          >
            <X size={12} />
            <span>Close Window</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-sky-400">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-sky-200 font-mono text-[10px]">ESC</kbd> to close</span>
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
        <span>© {new Date().getFullYear()} <strong>Mittsunee</strong> · All rights reserved</span>
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

