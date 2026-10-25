# 🌸 Mittsunee Commission Web — Project Documentation & Architectural Overview

Comprehensive overview of the architecture, features, codebase structure, and workflows of **Mittsunee Web**.

---

## 📌 1. Project Summary

- **Project Name**: Mittsunee Commission Web (`mittsuneeweb`)
- **Artist / Owner**: **Mittsunee** (Tasya) — Illustrator, Character Designer, & Live2D Artist.
- **Design Aesthetic**: Soft pastel sky blue anime micro-site / interactive portfolio (Carrd-inspired window card overlay architecture), featuring interactive artwork previews, a dual-currency commission pricing engine (USD & IDR), Terms of Service, and a secret admin dashboard.
- **Target Audience**: International commission clients (via VGen/PayPal) and Indonesian domestic clients (via BCA/DANA/GoPay).

---

## 🛠️ 2. Tech Stack & System Architecture

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** + **TypeScript** | Latest React concurrent features with strict type checking. |
| **Build Tool** | **Vite 8** | Instant HMR development server and fast optimized production bundling. |
| **Styling** | **Tailwind CSS v4** | Custom design tokens (`--color-sky-*`, `#FAFCFF`, `#EEF4FB`, Fredoka & Fredoka One typography). |
| **Motion & Icons** | **Motion/React (v14)** + **Lucide React** | Fluid spring physics, exit animations, and cohesive iconography. |
| **Backend & Database** | **Supabase (PostgreSQL)** | `public.portfolios` table with Row Level Security (RLS) policies. |
| **Storage & CDN** | **Supabase Storage** | Public `portfolio` bucket with on-the-fly thumbnail transformation CDN (`/render/image/public/`). |
| **Asset Optimization** | **Sharp** & **FFmpeg** | Automated scripts for asset compression and WebP conversion. |
| **Deployment** | **Vercel** | SPA rewrite rule configuration in `vercel.json`. |

---

## 🌟 3. Key Feature Breakdown

### 🎨 A. Interactive Landing & Hero
- **Mascot Animation**: Mittsunee's original character (`Original Character.webp`) with smooth gentle floating motion.
- **Live Commission Status**: Real-time badge (*Open / Closed*) with a pulsing status dot.
- **In-Hero Navigation**: 2x2 grid on mobile and 4-column cards on desktop providing instant access to Portfolio, Pricing, Terms, and Contact.
- **Direct Action Links**: One-click VGen ordering and links to X (Twitter), Instagram, Facebook, and Email.

### 🖼️ B. Dynamic Portfolio Gallery
- **Hybrid Data Source**: 30+ built-in fallback artworks that automatically synchronize with Supabase PostgreSQL on mount.
- **Client Session Caching**: 5-minute `sessionStorage` cache (`mittsunee_portfolios_v2`) to eliminate redundant database queries.
- **Proportionate Aspect Ratio Grid**: Hardware-accelerated grid (2 columns on mobile, up to 4 columns on desktop).
- **Mascot Loading Indicator**: Cute anime eye pulse animation (`Loading Eye.webp`) during image loads.
- **Infinite Scrolling**: Automatic batch loading (6 artworks per batch) using `IntersectionObserver`.
- **Category Filter**: Instant switching between *Illustration*, *Chibi*, *Live2D*, and *SKEB*.

### 🔍 C. Fullscreen Lightbox & Desktop Loupe Lens
- **Modal Viewer**: Keyboard-controlled high-res viewer (`ESC`, Arrow Left, Arrow Right).
- **Progressive Preview**: Instant blurred low-res thumbnail preview while the full-resolution artwork is downloaded.
- **Desktop Loupe (2.5x Magnifier)**: Dedicated pointer loupe with a center crosshair reticle and glass reflection for inspecting fine lineart details.

### 💰 D. Multi-Currency Commission Pricing
- **Instant Currency Switcher**: Seamless toggling between **USD ($)** and **IDR (Rp)**.
- **Commission Tiers**:
  - *Illustration*: Headshot, Bust Up, Half Body, Knee Up, Full Body.
  - *Chibi Style*: Full Body Chibi.
  - *SKEB Style*: Surprise commission (pose & vibe decided by artist, no design revisions).
  - *Live2D Model Art*: Half Body & Full Body (Ready to Rig PSD).
- **Transparent Add-ons**: Additional characters (+100%), custom backgrounds, commercial licensing (+100%), and rush fees.

### 📜 E. Terms of Service (ToS)
- Accordion-based terms covering:
  1. *Commercial Usage* (Tier 0: Personal, Tier 1: VTuber Support Free, Tier 2: Commercial Asset +100%).
  2. *General Guidelines* (Content boundaries, respectful communication).
  3. *Workflow & Revisions* (50% deposit, rough sketch stage with 2 free revision rounds).
  4. *Copyright & Attribution* (Watermark protection, strict AI training & NFT prohibition).
  5. *Payments & Refunds* (Accepted channels, deposit terms, and cancellation policies).

### 🪟 F. Page Overlay Card Window System
- Content pages open as an aesthetic **Window Card Overlay** above the hero without changing the main route:
  - Header window controls: Quick tab switcher, maximize/restore toggle, and close button.
  - Automatic mobile viewport scroll-lock to eliminate unwanted rubber-banding.

### 🔐 G. Secret Admin Panel (`/cyela` or `#/cyela`)
- Secret hidden route for portfolio management.
- **Authentication**: Local/session credential verification.
- **Portfolio Management**:
  - Client-side auto-compression to WebP (max 2200px) before upload to Supabase Storage.
  - Direct form inputs for Title, Subtitle, Category, Tags, and Featured status.
  - Delete and refresh capabilities with automated cache invalidation.

---

## 📂 4. Project Directory Map

```
MittsuneeWeb/
├── public/                       # Static public assets (Original Character, Loading Eye, Cursor, Logo)
│   ├── Original Character.webp  # Optimized mascot image
│   ├── Loading Eye.webp         # Anime eye loading indicator
│   ├── Type Logo.png            # Mittsunee typography logo
│   ├── Cursor.svg               # Custom pastel cursor
│   └── favicon.svg / png        # Website favicon
├── scripts/                      # Developer utility scripts
│   ├── convert_and_upload.mjs   # FFmpeg batch converter & Supabase uploader
│   ├── generate_docx.mjs        # Word (.docx) document generator
│   └── optimize-assets.mjs      # Sharp script for compressing public assets
├── src/
│   ├── assets/                  # Local asset imports
│   ├── lib/
│   │   ├── auth.ts              # Admin session authentication helpers
│   │   └── supabase.ts          # Supabase client, queries, upload & CDN thumbnail helpers
│   ├── AdminLoginPage.tsx       # Secret admin login screen
│   ├── AdminPortfolioPage.tsx   # Artwork management dashboard
│   ├── App.tsx                  # Main monolithic application view
│   ├── index.css                # Tailwind v4 configuration & theme tokens
│   └── main.tsx                 # React entry point
├── PRICELIST_AND_TOS.md         # Commission price list & Terms of Service guide
├── supabase_schema.sql           # Database schema, RLS policies, & bucket setup
├── package.json                 # Project dependencies & scripts
└── vercel.json                  # SPA routing configuration
```

---

## 💡 5. Recommended Next Steps

1. **Modularizing `App.tsx`**: Split the 2,250-line monolithic file into clean component modules inside `src/components/` (`HeroSection`, `PortfolioSection`, `LightboxModal`, `PricingSection`, `ToSSection`).
2. **Supabase Auth for Admin**: Upgrade the client-side credential check to official Supabase Authentication (`supabase.auth.signInWithPassword`).
3. **BGM Player**: Implement the floating mini audio player widget for relaxing lo-fi/anime background music.
