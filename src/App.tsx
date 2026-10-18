import { useState, createContext, useContext, useCallback, useEffect, useRef, lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'
import type { Variants } from 'motion/react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Heart, Mail, ChevronDown, X, ExternalLink,
  ZoomIn, ChevronLeft, ChevronRight, Globe,
  ShoppingCart, MessageCircle, Star, Sparkles,
  Palette, Coins, FileText,
  Maximize2, Minimize2
} from 'lucide-react'
import { checkIsAdminAuthenticated, logoutAdmin } from './lib/auth'
import { isSupabaseConfigured, getPortfoliosFromDB, getThumbnailUrl } from './lib/supabase'

const AdminLoginPage = lazy(() => import('./AdminLoginPage'))
const AdminPortfolioPage = lazy(() => import('./AdminPortfolioPage'))



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
    desc: 'High-quality character illustrations with clean lines, expressive poses, and soft vibrant coloring.',
    types: [
      {
        name: 'Character Illustration',
        prices: [
          { shot: 'Headshot', usd: 35, idr: 100_000 },
          { shot: 'Bust Up', usd: 60, idr: 150_000 },
          { shot: 'Half Body', usd: 75, idr: 200_000 },
          { shot: 'Knee Up', usd: 85, idr: 250_000 },
          { shot: 'Full Body', usd: 100, idr: 300_000 },
        ],
        addons: [
          { name: 'Additional Character', label: '+100% base price' },
          { name: 'Background (Simple/White/Transparent)', label: 'FREE' },
          { name: 'Custom / Complex Background', label: '+$10–$70 (Negotiable)' },
          { name: 'VTuber Support (PFP/Thumbnail/Banner)', label: 'FREE (Non-merch)' },
          { name: 'Commercial Use (For Asset/Merchandise)', label: '+100% base price' },
          { name: 'Rush Fee (2-4 Days)', label: '2x Price' },
        ],
      },
    ],
  },
  {
    id: 'chibi',
    name: 'Chibi',
    emoji: '🌸',
    desc: 'Cute and expressive chibi characters, perfect for icons, badges, emotes, and stickers.',
    types: [
      {
        name: 'Chibi Style',
        prices: [
          { shot: 'Full Body Chibi', usd: 30, idr: 100_000 },
        ],
        addons: [
          { name: 'Additional Character', label: '+100% base price' },
          { name: 'Background (Simple/Transparent)', label: 'FREE' },
          { name: 'VTuber Support (PFP/Thumbnail/Banner)', label: 'FREE (Non-merch)' },
          { name: 'Commercial Use (For Asset/Merchandise)', label: '+100% base price' },
        ],
      },
    ],
  },
  {
    id: 'skeb',
    name: 'SKEB',
    emoji: '✨',
    desc: 'Surprise commissions in signature style. Pose, vibe, and composition are left to the artist (No design revisions).',
    types: [
      {
        name: 'Surprise Commission (SKEB Style)',
        note: 'Concept and composition decided by artist. Design revisions are not included.',
        prices: [
          { shot: 'Headshot', usd: 30, idr: 85_000 },
          { shot: 'Bust Up', usd: 40, idr: 120_000 },
          { shot: 'Half Body', usd: 50, idr: 160_000 },
          { shot: 'Full Body', usd: 60, idr: 220_000 },
        ],
        addons: [
          { name: 'Background', label: 'FREE (Artist choice)' },
          { name: 'Additional Character', label: '+100% base price' },
          { name: 'Rush Fee (2-4 Days)', label: '2x Price' },
        ],
      },
    ],
  },
  {
    id: 'live2d',
    name: 'Live2D',
    emoji: '🎭',
    desc: 'Layer-separated PSD model art, cut and ready for riggers. (Art Only — Rigging NOT included).',
    types: [
      {
        name: 'Model Art (Ready to Rig)',
        note: 'Delivered as organized layered PSD ready for rigging. Rigging service is NOT included.',
        prices: [
          { shot: 'Half Body Model Art', usd: 180, idr: 850_000 },
          { shot: 'Full Body Model Art', usd: 300, idr: 1_500_000 },
        ],
        addons: [
          { name: 'Character Design by Artist', usd: 80, idr: 350_000 },
          { name: 'Additional Outfit', usd: 60, idr: 250_000 },
          { name: 'Additional Hairstyle', usd: 40, idr: 150_000 },
          { name: 'Extra Expression / Hand Toggle', usd: 15, idr: 50_000 },
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
      { tier: 'Tier 0: Personal', usage: 'Private use, wallpapers, personal social avatars', fee: 'Included' },
      { tier: 'Tier 1: VTuber Support', usage: 'PFP, streaming thumbnail, banner (non-merchandise)', fee: 'FREE ✦' },
      { tier: 'Tier 2: Commercial Asset', usage: 'Merchandise, company assets, monetized content', fee: '+100%' },
    ],
    items: [
      'Orders default to Tier 0 (Personal Use) / Tier 1 (VTuber Support).',
      'VTuber Support is FREE for PFP, Thumbnails, and Banners as long as it is not sold as merchandise.',
      'For Asset / Merchandise / Monetized projects, commercial use is +100% of the base price.',
      'Please state any commercial intentions when sending your inquiry.',
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


function XIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FacebookIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

// ─── Hero Section ────────────────────────────────────────────────────────────

interface HeroSectionProps {
  onNavigate: (page: ActivePage) => void
}

function HeroSection({ onNavigate }: HeroSectionProps) {
  const socials = [
    { icon: Globe, label: 'VGen', href: 'https://vgen.co/Mittsunee', color: '#74A2DD' },
    { icon: XIcon, label: 'X (Twitter)', href: 'https://x.com/Mittsunee', color: '#0F1419' },
    { icon: Heart, label: 'Instagram', href: 'https://www.instagram.com/mittsunee/', color: '#E1306C' },
    { icon: FacebookIcon, label: 'Facebook', href: 'https://www.facebook.com/gazzela.chi', color: '#1877F2' },
    { icon: Mail, label: 'Email', href: 'mailto:mittsune112@gmail.com', color: '#74A2DD' },
  ]

  const navItems = [
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
    <section id="hero" className="relative flex-1 flex flex-col items-center justify-center overflow-hidden px-3 sm:px-6 py-1 sm:py-4">
      {/* Decorative background orbs with zero-cost radial gradients */}
      <div className="absolute top-12 left-1/4 w-72 h-72 md:w-96 md:h-96 rounded-full bg-[radial-gradient(circle,rgba(159,197,232,0.3)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 w-60 h-60 md:w-80 md:h-80 rounded-full bg-[radial-gradient(circle,rgba(116,162,221,0.22)_0%,transparent_70%)] pointer-events-none" />

      {/* ─── MOBILE VIEW (< md): Layout matching user mockup ─── */}
      <div className="md:hidden flex flex-col items-center text-center gap-1.5 sm:gap-2 w-full max-w-sm mx-auto my-auto select-none">
        {/* 1. Mascot Character with soft circular backdrop */}
        <div className="relative flex items-center justify-center w-24 h-24 my-0.5">
          <div className="w-20 h-20 rounded-full bg-sky-100/50 border border-dashed border-sky-200/70 absolute inset-0 m-auto pointer-events-none" />
          <img
            src="/Original Character.webp"
            alt="Mittsunee Mascot"
            className="relative z-10 w-full h-full object-contain drop-shadow-sm select-none animate-gentle-float"
            width={96}
            height={96}
            loading="eager"
            decoding="async"
          />
        </div>

        {/* 2. Status Badges */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="tag text-[9px] py-0.5 px-2.5 font-medium">
            <Sparkles size={10} />
            Illustrator
          </span>
          <button
            type="button"
            onClick={() => onNavigate('pricing')}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-semibold cursor-pointer transition-all hover:scale-105 ${
              COMMISSION_STATUS === 'open'
                ? 'bg-green-50 text-green-700 border border-green-200 shadow-2xs'
                : 'bg-red-50 text-red-700 border border-red-200 shadow-2xs'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              COMMISSION_STATUS === 'open' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            {COMMISSION_STATUS === 'open' ? 'Commissions OPEN' : 'Commissions CLOSED'}
          </button>
        </div>

        {/* 3. Mittsunee Logo */}
        <div className="flex justify-center">
          <img
            src="/Type%20Logo.png"
            alt="Mittsunee"
            className="h-7 w-auto object-contain select-none"
          />
        </div>

        {/* 4. Tagline */}
        <p className="text-sky-500/80 text-[10px] font-medium tracking-wide">
          Character Art · Chibi · Live2D ✨
        </p>

        {/* 5. Quick Navigation Title */}
        <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-sky-400 pt-0.5">
          <Sparkles size={9} />
          <span>QUICK NAVIGATION</span>
        </div>

        {/* 6. 2x2 Grid Quick Navigation Cards */}
        <div className="grid grid-cols-2 gap-2 w-full max-w-[270px] mx-auto">
          {navItems.map(item => (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="flex flex-col items-center justify-center py-2 px-3 rounded-2xl bg-white/95 hover:bg-sky-50 border border-sky-100/90 hover:border-sky-300 shadow-2xs hover:shadow-xs transition-all text-center cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-full bg-sky-50 group-hover:bg-sky-100 flex items-center justify-center text-sky-400 group-hover:text-sky-500 mb-1 transition-colors">
                <item.icon size={15} />
              </div>
              <span className="text-xs font-bold text-sky-700 group-hover:text-sky-800 leading-tight">
                {item.title}
              </span>
            </motion.button>
          ))}
        </div>

        {/* 7. Action Row: CTA Button + 4 Social Circles */}
        <div className="flex items-center justify-center gap-2 pt-0.5">
          <a
            href="https://vgen.co/Mittsunee"
            target="_blank"
            rel="noreferrer"
            className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1 shadow-2xs"
          >
            <ShoppingCart size={12} />
            <span>Order via VGen</span>
          </a>

          <div className="flex items-center gap-1">
            {socials.map(s => (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                title={s.label}
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-7 h-7 rounded-full card flex items-center justify-center text-sky-400 hover:text-sky-500 shadow-2xs transition-colors"
              >
                <s.icon size={13} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* ─── DESKTOP VIEW (>= md): Full 2-Column Side-by-Side ─── */}
      <div className="hidden md:grid max-w-5xl mx-auto w-full grid-cols-2 gap-6 lg:gap-12 items-center my-auto">
        {/* Left: text content & in-hero navigation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-start text-left gap-3 md:gap-4 w-full"
        >
          {/* Status Badges */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-start gap-2">
            <span className="tag text-xs py-0.5 px-2.5">
              <Sparkles size={11} />
              Artist / Illustrator
            </span>
            <button
              type="button"
              onClick={() => onNavigate('pricing')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all hover:scale-105 ${
                COMMISSION_STATUS === 'open'
                  ? 'bg-green-50 text-green-700 border border-green-200 shadow-2xs'
                  : 'bg-red-50 text-red-700 border border-red-200 shadow-2xs'
              }`}
            >
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                COMMISSION_STATUS === 'open' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {COMMISSION_STATUS === 'open' ? 'Commissions OPEN' : 'Commissions CLOSED'}
            </button>
          </motion.div>

          {/* Mittsunee Logo */}
          <motion.div variants={itemVariants} className="flex justify-start">
            <img
              src="/Type%20Logo.png"
              alt="Mittsunee"
              className="h-12 lg:h-16 w-auto object-contain select-none"
            />
          </motion.div>

          {/* Bio text */}
          <motion.p variants={itemVariants} className="text-sky-500/80 text-sm md:text-base leading-relaxed max-w-md">
            Hello! I'm Mittsunee, an illustrator specializing in{' '}
            <span className="text-sky-400 font-semibold">character art</span>,{' '}
            <span className="text-sky-400 font-semibold">chibi</span>, and{' '}
            <span className="text-sky-400 font-semibold">Live2D model art</span>.
            Welcome to my commission portfolio! ✨
          </motion.p>

          {/* In-Hero Navigation Buttons */}
          <motion.div variants={itemVariants} className="w-full max-w-lg space-y-2 pt-0.5">
            <div className="flex items-center gap-2 justify-start">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                <Sparkles size={10} /> Quick Navigation
              </span>
              <div className="h-px bg-sky-200/50 flex-1" />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {navItems.map(item => (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="group flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/90 hover:bg-sky-50 border border-sky-100 hover:border-sky-300 shadow-2xs hover:shadow-xs transition-all text-center cursor-pointer"
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
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-start gap-3 pt-0.5">
            <a href="https://vgen.co/Mittsunee" target="_blank" rel="noreferrer" className="btn-primary !py-2 !px-4 text-sm">
              <ShoppingCart size={13} />
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
                  className="w-8 h-8 rounded-full card flex items-center justify-center text-sky-400 hover:text-sky-500 transition-colors shadow-2xs"
                >
                  <s.icon size={15} />
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
          className="flex relative justify-center items-end"
        >
          {/* Decorative ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-60 h-60 md:w-80 md:h-80 rounded-full border-2 border-dashed border-sky-200/50" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-sky-100/40" />
          </div>

          <img
            src="/Original Character.webp"
            alt="Mittsunee Original Character"
            className="relative z-10 w-full max-w-[210px] sm:max-w-xs md:max-w-sm max-h-[30vh] sm:max-h-[38vh] md:max-h-[48vh] object-contain drop-shadow-xl select-none animate-gentle-float"
            loading="eager"
            decoding="async"
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
            <span className="flex items-center gap-1.5">🎭 Live2D Model Art</span>
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

const LENS_WIDTH = 220
const LENS_HEIGHT = 140
const ZOOM_LEVEL = 2.5

function Lightbox({ items, initialIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [showLens, setShowLens] = useState(false)
  const [lensPos, setLensPos] = useState({
    x: 0,
    y: 0,
    bgX: 0,
    bgY: 0,
    bgW: 0,
    bgH: 0,
  })

  const item = items[current]
  const imgRef = useRef<HTMLImageElement>(null)
  const rafRef = useRef<number | null>(null)

  // Ensure desktop-only: requires large viewport (>=1024px), hover capability, and fine pointer
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches)
      if (!e.matches) setShowLens(false)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const prev = useCallback(() => {
    setShowLens(false)
    setImgLoaded(false)
    setCurrent(i => (i - 1 + items.length) % items.length)
  }, [items.length])

  const next = useCallback(() => {
    setShowLens(false)
    setImgLoaded(false)
    setCurrent(i => (i + 1) % items.length)
  }, [items.length])

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
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [onClose, prev, next])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDesktop || !imgLoaded || !imgRef.current) return

    const rect = imgRef.current.getBoundingClientRect()
    const clientX = e.clientX
    const clientY = e.clientY

    // Boundary check: must be directly over rendered artwork
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      if (showLens) setShowLens(false)
      return
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    rafRef.current = requestAnimationFrame(() => {
      const relX = clientX - rect.left
      const relY = clientY - rect.top

      const bgW = rect.width * ZOOM_LEVEL
      const bgH = rect.height * ZOOM_LEVEL

      // 1:1 true center calculation
      const bgX = -(relX * ZOOM_LEVEL) + LENS_WIDTH / 2
      const bgY = -(relY * ZOOM_LEVEL) + LENS_HEIGHT / 2

      setLensPos({
        x: clientX,
        y: clientY,
        bgX,
        bgY,
        bgW,
        bgH,
      })
      setShowLens(true)
    })
  }

  const handleMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setShowLens(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-6"
      style={{ background: 'rgba(12, 28, 56, 0.82)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      {/* Image card modal */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl max-h-[85vh] sm:max-h-[88vh] w-full flex flex-col border border-sky-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Main Artwork Preview Frame */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative flex-1 min-h-0 flex items-center justify-center bg-sky-50/60 p-4 sm:p-8 md:p-10 overflow-hidden"
        >
          {/* Progressive instant preview: render low-res thumbnail instantly while high-res loads */}
          {!imgLoaded && (
            <img
              src={getThumbnailUrl(item.image)}
              alt={item.title}
              className="absolute max-h-[48vh] sm:max-h-[54vh] md:max-h-[58vh] w-auto max-w-full object-contain rounded-xl select-none filter blur-xs opacity-60 pointer-events-none transition-opacity"
            />
          )}

          {/* Loading Eye indicator while high-res artwork loads */}
          {!imgLoaded && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none gap-2">
              <img
                src="/Loading%20Eye.webp"
                alt="Loading preview"
                className="w-20 sm:w-28 h-auto object-contain select-none opacity-85 drop-shadow-xs animate-gentle-pulse"
                width={112}
                height={56}
              />
              <span className="text-[10px] text-sky-400 font-medium">Opening artwork preview...</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.img
              ref={imgRef}
              key={item.id}
              src={item.image}
              alt={item.title}
              onLoad={() => setImgLoaded(true)}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: imgLoaded ? 1 : 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              className={`max-h-[48vh] sm:max-h-[54vh] md:max-h-[58vh] w-auto max-w-full object-contain rounded-xl shadow-xs select-none ${
                isDesktop && imgLoaded ? 'cursor-none' : ''
              }`}
            />
          </AnimatePresence>

          {/* Desktop Loupe / Magnifier Lens (rendered to document.body to escape modal transform containing block) */}
          {isDesktop && showLens && typeof document !== 'undefined' && createPortal(
            <div
              style={{
                position: 'fixed',
                left: lensPos.x - LENS_WIDTH / 2,
                top: lensPos.y - LENS_HEIGHT / 2,
                width: LENS_WIDTH,
                height: LENS_HEIGHT,
                backgroundImage: `url(${item.image})`,
                backgroundPosition: `${lensPos.bgX}px ${lensPos.bgY}px`,
                backgroundSize: `${lensPos.bgW}px ${lensPos.bgH}px`,
                backgroundRepeat: 'no-repeat',
                pointerEvents: 'none',
                zIndex: 99999,
              }}
              className="rounded-2xl border-2 border-sky-400 bg-slate-900 ring-2 ring-white/80 shadow-[0_12px_36px_rgba(14,165,233,0.35)] overflow-hidden transition-opacity duration-150 animate-in fade-in zoom-in-95"
            >
              {/* Glass subtle gradient highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/10 via-transparent to-white/20 pointer-events-none" />

              {/* Center crosshair reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative flex items-center justify-center">
                  <div className="w-5 h-[1.5px] bg-sky-400/85 shadow-xs" />
                  <div className="h-5 w-[1.5px] bg-sky-400/85 shadow-xs absolute" />
                  <div className="w-2.5 h-2.5 rounded-full border border-sky-400/90 absolute bg-white/30 backdrop-blur-2xs" />
                </div>
              </div>

              {/* Zoom scale badge */}
              <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-950/75 border border-sky-400/50 text-[9px] font-bold text-sky-200 tracking-wider backdrop-blur-xs select-none">
                <ZoomIn size={10} className="text-sky-300" />
                <span>2.5×</span>
              </div>
            </div>,
            document.body
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            onMouseEnter={() => setShowLens(false)}
            title="Close Preview (ESC)"
            className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-white/95 hover:bg-rose-500 text-sky-600 hover:text-white backdrop-blur shadow-md flex items-center justify-center transition-all cursor-pointer group"
          >
            <X size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
          </button>

          {/* Prev / Next navigation buttons */}
          <button
            type="button"
            onClick={prev}
            onMouseEnter={() => setShowLens(false)}
            title="Previous Artwork (Left Arrow)"
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-sky-600 hover:text-sky-800 backdrop-blur shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={next}
            onMouseEnter={() => setShowLens(false)}
            title="Next Artwork (Right Arrow)"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-sky-600 hover:text-sky-800 backdrop-blur shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
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
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Desktop zoom hint */}
            {isDesktop && (
              <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-sky-400/90 font-medium bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                <ZoomIn size={11} className="text-sky-400" />
                <span>Hover to zoom</span>
              </span>
            )}
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
    <div className="py-16 sm:py-24 flex flex-col items-center justify-center text-center px-4">
      {/* Animated glowing container with Mittsunee Loading Eye */}
      <div className="relative mb-5 flex flex-col items-center">
        {/* Soft glowing aura behind the eyes */}
        <div className="absolute -inset-6 rounded-3xl bg-[radial-gradient(circle,rgba(159,197,232,0.45)_0%,transparent_70%)] pointer-events-none" />

        {/* Decorative subtle border frame with animated Loading Eyes */}
        <div className="relative px-6 py-4 rounded-3xl bg-white/95 border border-sky-100 shadow-sm flex items-center justify-center">
          <img
            src="/Loading%20Eye.webp"
            alt="Loading artworks"
            className="w-36 sm:w-48 h-auto object-contain drop-shadow-xs select-none animate-gentle-pulse"
            width={192}
            height={96}
          />

          {/* Floating cute sparkle accents */}
          <motion.span
            animate={{ rotate: [0, 20, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-sky-300 text-white flex items-center justify-center text-[10px] font-bold shadow-xs"
          >
            ✦
          </motion.span>
          <motion.span
            animate={{ rotate: [0, -20, 0], scale: [1.1, 0.9, 1.1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute -bottom-1.5 -left-1.5 w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-[9px] font-bold shadow-xs"
          >
            ✨
          </motion.span>
        </div>
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
        Opening eyes to recent illustrations and models...
      </motion.p>

      {/* Sleek shimmer loading bar */}
      <div className="w-44 h-1.5 bg-sky-100 rounded-full mt-4 overflow-hidden relative">
        <motion.div
          animate={{ x: [-100, 180] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-full bg-gradient-to-r from-transparent via-sky-400 to-transparent rounded-full"
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
  const thumbUrl = getThumbnailUrl(item.image)
  const [useFallback, setUseFallback] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const currentSrc = useFallback ? item.image : thumbUrl

  // Immediately reveal if image is already cached by the browser
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true)
    }
  }, [currentSrc])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: Math.min((index % 6) * 0.05, 0.25),
        ease: 'easeOut',
      }}
      onClick={onClick}
      className="group relative card overflow-hidden cursor-pointer bg-white border border-sky-100/90 shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col"
    >
      {/* Proportionate Aspect Ratio Frame */}
      <div className="relative w-full aspect-square overflow-hidden bg-sky-50/70 flex items-center justify-center p-1 sm:p-2">
        {/* Lightweight Skeleton with Loading Eye until image is loaded */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-sky-50/90 pointer-events-none p-2 text-center animate-gentle-pulse">
            <div className="flex flex-col items-center justify-center gap-1">
              <img
                src="/Loading%20Eye.webp"
                alt="Loading artwork"
                className="w-12 sm:w-16 h-auto object-contain select-none drop-shadow-2xs opacity-85"
                width={64}
                height={32}
              />
              <span className="text-[8px] sm:text-[9px] font-medium text-sky-400 tracking-wide">
                Loading...
              </span>
            </div>
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
            src={currentSrc}
            alt={item.title}
            loading={index < 4 ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              if (!useFallback) {
                // Fallback to original high-res URL if transformation is unavailable
                setUseFallback(true)
              } else {
                setHasError(true)
                setIsLoaded(true)
              }
            }}
            className={`w-full h-full object-contain rounded-lg sm:rounded-xl transition-all duration-200 group-hover:scale-105 ${
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
                  type="button"
                  onClick={() => handleFilterChange(tab.id)}
                  className={`px-3 sm:px-5 py-1 sm:py-2 rounded-full text-[11px] sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    filter === tab.id
                      ? 'bg-sky-400 text-white shadow-xs'
                      : 'bg-white/85 text-sky-500 hover:text-sky-700 hover:bg-sky-50 border border-sky-100/80'
                  }`}
                >
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
                  <div className="flex items-center gap-2 text-sky-500 font-medium bg-white/95 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-sky-100 shadow-xs text-xs animate-pulse">
                    <img
                      src="/Loading%20Eye.webp"
                      alt="Loading more"
                      className="h-3.5 sm:h-4 w-auto object-contain select-none"
                    />
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
    <div className="inline-flex items-center gap-1 p-1 rounded-full bg-sky-100/70 border border-sky-200/60 shadow-2xs">
      <button
        type="button"
        onClick={() => currency === 'idr' && toggle()}
        className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
          currency === 'usd'
            ? 'bg-sky-500 text-white shadow-xs'
            : 'text-sky-600 hover:text-sky-800 hover:bg-sky-50/60'
        }`}
      >
        $ USD
      </button>
      <button
        type="button"
        onClick={() => currency === 'usd' && toggle()}
        className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
          currency === 'idr'
            ? 'bg-sky-500 text-white shadow-xs'
            : 'text-sky-600 hover:text-sky-800 hover:bg-sky-50/60'
        }`}
      >
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
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-8">
          {COMMISSION_DATA.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === cat.id
                  ? 'bg-sky-400 text-white shadow-xs'
                  : 'bg-white/85 text-sky-500 hover:text-sky-700 hover:bg-sky-50 border border-sky-100/80'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
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
            <a href="https://vgen.co/Mittsunee" target="_blank" rel="noreferrer" className="text-sky-500 font-semibold hover:text-sky-400 underline underline-offset-2">
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
      href: 'https://vgen.co/Mittsunee',
      icon: ShoppingCart,
      primary: true,
    },
    {
      label: 'X (Twitter)',
      description: 'Follow updates & art',
      href: 'https://x.com/Mittsunee',
      icon: XIcon,
      primary: false,
    },
    {
      label: 'Instagram',
      description: 'DM for art & inquiries',
      href: 'https://www.instagram.com/mittsunee/',
      icon: Heart,
      primary: false,
    },
    {
      label: 'Facebook',
      description: 'Direct message & updates',
      href: 'https://www.facebook.com/gazzela.chi',
      icon: FacebookIcon,
      primary: false,
    },
    {
      label: 'Email',
      description: 'Formal inquiries & invoices',
      href: 'mailto:mittsune112@gmail.com',
      icon: Mail,
      primary: false,
    },
  ]

  return (
    <section id="contact" className="py-4 sm:py-8 px-3 sm:px-6 flex-1 flex flex-col justify-center my-auto">
      <div className="max-w-4xl mx-auto w-full my-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="text-center mb-6 sm:mb-8"
        >
          <motion.p variants={fadeUp} className="text-sky-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2">✦ Get In Touch</motion.p>
          <motion.h2 variants={fadeUp} className="section-title text-2xl sm:text-3xl">Contact & Order</motion.h2>
          <motion.p variants={fadeUp} className="section-subtitle mt-1 sm:mt-2 text-xs sm:text-sm">
            Ready to commission? Here's how to reach me!
          </motion.p>
        </motion.div>

        {/* Contact cards - 2 per row on mobile, 5 on desktop */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3.5 mb-4 sm:mb-6"
        >
          {contacts.map((c, idx) => (
            <motion.a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className={`card p-3 sm:p-4 flex flex-col items-center text-center gap-2 sm:gap-2.5 transition-all duration-200 cursor-pointer rounded-2xl bg-white hover:border-sky-300 hover:shadow-md group relative ${
                c.primary ? 'border-sky-300/80 shadow-xs' : ''
              } ${idx === 4 ? 'col-span-2 sm:col-span-1 max-w-[220px] md:max-w-none mx-auto md:mx-0 w-full' : ''}`}
            >
              {c.primary && (
                <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-sky-400 text-white text-[9px] font-bold shadow-2xs">
                  Main
                </span>
              )}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-sky-50 group-hover:bg-sky-100/90 flex items-center justify-center text-sky-400 group-hover:text-sky-500 transition-colors shrink-0">
                <c.icon size={20} className="sm:hidden" />
                <c.icon size={22} className="hidden sm:block" />
              </div>
              <div className="w-full">
                <p className="font-bold text-xs sm:text-sm text-sky-700 group-hover:text-sky-800 leading-tight">
                  {c.label}
                </p>
                <p className="text-[10px] sm:text-xs text-sky-400 mt-0.5 line-clamp-1">
                  {c.description}
                </p>
              </div>
              <span className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-sky-500 group-hover:text-sky-600 mt-auto">
                <span>{c.primary ? 'Order Now' : 'Visit Link'}</span>
                <ExternalLink size={10} className="sm:size-[11px]" />
              </span>
            </motion.a>
          ))}
        </motion.div>

        {/* Credit note */}
        <div className="text-center text-sky-300 text-xs mt-2 sm:mt-4">
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
      className="fixed inset-0 z-50 flex items-center justify-center px-2 py-7 sm:px-5 sm:py-6 md:p-8 bg-sky-950/45 backdrop-blur-xs sm:backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 35 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 25 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        onClick={e => e.stopPropagation()}
        className={`relative w-full bg-white shadow-2xl border border-sky-100 flex flex-col overflow-hidden transition-all duration-300 ${
          isExpanded
            ? 'max-w-[98vw] h-[97vh] rounded-2xl'
            : 'max-w-5xl max-h-[82dvh] h-[80dvh] sm:max-h-[90dvh] sm:h-[86dvh] rounded-2xl sm:rounded-3xl'
        }`}
      >
        {/* Card Header / Window Controls */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-white/98 sm:bg-white/95 border-b border-sky-100/80 gap-2 sm:gap-3">
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
        <div className="overflow-y-auto flex-1 custom-scrollbar flex flex-col overscroll-contain">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`w-full ${activePage === 'contact' ? 'flex-1 flex flex-col justify-center my-auto' : ''}`}
            >
              {activePage === 'portfolio' && <PortfolioSection />}
              {activePage === 'pricing' && <PricingSection onNavigateContact={() => onNavigate('contact')} />}
              {activePage === 'tos' && <ToSSection />}
              {activePage === 'contact' && <ContactSection />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card Footer Bar */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-sky-50/60 border-t border-sky-100 flex items-center justify-end sm:justify-between text-xs text-sky-400 gap-2">
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-sky-400">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-sky-200 font-mono text-[10px]">ESC</kbd> to close</span>
          </div>
          <a
            href="https://vgen.co/Mittsunee"
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
    <footer className="w-full py-2 px-4 sm:px-6 bg-white/40 backdrop-blur-sm border-t border-sky-100/60 shrink-0 text-center select-none">
      <div className="max-w-5xl mx-auto flex items-center justify-center sm:justify-between text-[10px] sm:text-[11px] text-sky-400">
        <span>© {new Date().getFullYear()} <strong className="text-sky-500 font-bold">Mittsunee</strong> · All rights reserved</span>
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
  const [isAdminAuth, setIsAdminAuth] = useState(checkIsAdminAuthenticated)
  const [currency, setCurrency] = useState<Currency>('usd')
  const toggle = useCallback(() => setCurrency(c => c === 'usd' ? 'idr' : 'usd'), [])
  const [activePage, setActivePage] = useState<ActivePage | null>(null)

  // Listen to browser navigation / URL changes for secret /cyela route
  useEffect(() => {
    const handleLocationChange = () => {
      const onAdmin = checkIsAdminRoute()
      setIsAdmin(onAdmin)
      if (onAdmin) {
        setIsAdminAuth(checkIsAdminAuthenticated())
      }
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

  // Handle Admin Logout
  const handleLogoutAdmin = useCallback(() => {
    logoutAdmin()
    setIsAdminAuth(false)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePage(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Lock body & html scroll on public site so mobile viewport never bounces or scrolls
  useEffect(() => {
    if (!isAdmin) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isAdmin])

  // If secret route /cyela is active, show the Admin Login or Admin Portfolio Page
  if (isAdmin) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#FAFCFF] flex items-center justify-center text-sky-400 font-medium">
            Loading Admin...
          </div>
        }
      >
        {!isAdminAuth ? (
          <AdminLoginPage
            onSuccess={() => setIsAdminAuth(true)}
            onExit={handleExitAdmin}
          />
        ) : (
          <AdminPortfolioPage
            onExit={handleExitAdmin}
            onLogout={handleLogoutAdmin}
          />
        )}
      </Suspense>
    )
  }

  return (
    <CurrencyCtx.Provider value={{ currency, toggle }}>
      <div className="fixed inset-0 w-full h-full overflow-hidden flex flex-col justify-between select-none">
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

