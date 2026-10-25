# 🌸 Mittsunee Web — Website SEO Implementation Guide

This document is a practical, step-by-step technical guide for configuring and deploying on-page SEO, social sharing previews (Open Graph & Twitter Cards), Rich Snippet Schema (JSON-LD), and search crawler controls inside the **Mittsunee Web** codebase.

---

## 📋 Checklist Overview

- [ ] **Step 1**: Configure Meta Tags & Open Graph in `index.html`
- [ ] **Step 2**: Add Structured Data Schema (`VisualArtist` & `Offer`) in `index.html`
- [ ] **Step 3**: Create `public/robots.txt` (with secret `/cyela` route protection)
- [ ] **Step 4**: Create `public/sitemap.xml`
- [ ] **Step 5**: Create Social Share Banner (`public/og-banner.png`)
- [ ] **Step 6**: Optimize Image SEO (`alt` attributes) in `src/App.tsx`
- [ ] **Step 7**: Google Search Console & Social Preview Verification

---

## 🛠️ Step 1: Update `index.html` Meta Tags

Open file: [`index.html`](file:///C:/Users/Mueee/Documents/Mueee/Website/MittsuneeWeb/index.html)

Replace the `<head>` section with the following comprehensive metadata:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Primary Title & Description -->
    <title>Mittsunee | Anime Art Commissions, Chibi & Live2D Model Art</title>
    <meta name="title" content="Mittsunee | Anime Art Commissions, Chibi & Live2D Model Art" />
    <meta name="description" content="Official commission portfolio of Mittsunee (@Mittsunee). High-quality anime character illustrations, cute chibi art, and ready-to-rig Live2D model art. Open for international & Indonesian orders." />
    <meta name="keywords" content="Mittsunee, anime art commission, jasa gambar anime, chibi commission, live2d model art, character design, vgen artist, komisi vtuber, anime illustrator" />
    <meta name="author" content="Mittsunee" />
    <meta name="robots" content="index, follow" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://mittsunee.art/" />

    <!-- Favicon & Icons -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="64x64" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/Original Character.png" />

    <!-- Open Graph / Facebook / Discord / WhatsApp -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://mittsunee.art/" />
    <meta property="og:title" content="🌸 Mittsunee | Anime Art & Commission Portfolio" />
    <meta property="og:description" content="Character Art · Chibi · Live2D Model Art. Explore gallery, transparent price list (USD & IDR), and order guidelines." />
    <meta property="og:image" content="https://mittsunee.art/og-banner.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Mittsunee Commission Portfolio Banner" />
    <meta property="og:site_name" content="Mittsunee Studio" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter / X Cards -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@Mittsunee" />
    <meta name="twitter:creator" content="@Mittsunee" />
    <meta name="twitter:title" content="🌸 Mittsunee | Anime Art & Commission Portfolio" />
    <meta name="twitter:description" content="Anime Character Art · Chibi · Live2D Model Art. Commissions Open on VGen & direct inquiries." />
    <meta name="twitter:image" content="https://mittsunee.art/og-banner.png" />

    <!-- Google Fonts: Fredoka -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&family=Fredoka+One&display=swap" rel="stylesheet">
```

---

## 🏷️ Step 2: Add JSON-LD Structured Data (Rich Snippet Schema)

Place this script block right before the closing `</head>` tag in `index.html`. This directly signals Google Search that you are an verified **Visual Artist** with active commission services:

```html
    <!-- JSON-LD Structured Data Schema -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "VisualArtist",
      "name": "Mittsunee",
      "alternateName": ["Tasya", "Mittsunee Studio"],
      "url": "https://mittsunee.art",
      "image": "https://mittsunee.art/Original%20Character.webp",
      "description": "Freelance anime character illustrator, chibi artist, and Live2D model designer.",
      "sameAs": [
        "https://vgen.co/Mittsunee",
        "https://x.com/Mittsunee",
        "https://www.instagram.com/mittsunee/",
        "https://www.facebook.com/gazzela.chi"
      ],
      "knowsAbout": [
        "Anime Illustration",
        "Character Design",
        "Chibi Art",
        "Live2D Model Art",
        "Digital Painting"
      ],
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "lowPrice": "30.00",
        "highPrice": "300.00",
        "offerCount": "4",
        "offers": [
          {
            "@type": "Offer",
            "name": "Chibi Style Commission",
            "price": "35.00",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "url": "https://vgen.co/Mittsunee"
          },
          {
            "@type": "Offer",
            "name": "Character Illustration",
            "price": "35.00",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "url": "https://vgen.co/Mittsunee"
          },
          {
            "@type": "Offer",
            "name": "SKEB Surprise Commission",
            "price": "30.00",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "url": "https://vgen.co/Mittsunee"
          },
          {
            "@type": "Offer",
            "name": "Live2D Model Art (Ready to Rig)",
            "price": "180.00",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "url": "https://vgen.co/Mittsunee"
          }
        ]
      }
    }
    </script>
```

---

## 🤖 Step 3: Create `public/robots.txt`

Target path: `C:\Users\Mueee\Documents\Mueee\Website\MittsuneeWeb\public\robots.txt`

> [!IMPORTANT]
> The `Disallow` directives below keep Google and other crawlers from exposing the secret admin login route `/cyela` in public search results.

```txt
User-agent: *
Allow: /

# Prevent search engines from indexing the secret admin panel
Disallow: /cyela
Disallow: /cyela/
Disallow: /#cyela
Disallow: /#/cyela

# Sitemap location
Sitemap: https://mittsunee.art/sitemap.xml
```

---

## 🗺️ Step 4: Create `public/sitemap.xml`

Target path: `C:\Users\Mueee\Documents\Mueee\Website\MittsuneeWeb\public\sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mittsunee.art/</loc>
    <lastmod>2026-10-25</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

---

## 🖼️ Step 5: Social Sharing Banner (`og-banner.png`)

When links are shared on Discord, Twitter/X, Telegram, or WhatsApp, social platforms look for the image specified in `og:image`.

- **Recommended Dimensions**: **1200 × 630 pixels** (Standard 1.91:1 ratio).
- **Target File Path**: `public/og-banner.png` (or `public/og-banner.webp`).
- **Design Content**:
  - Soft pastel sky blue background (`#EEF4FB`).
  - Mittsunee Mascot (`Original Character.webp`) on the right.
  - "Mittsunee" Type Logo on the left.
  - Subtitle: *"Anime Illustration · Chibi · Live2D Model Art"*.
  - Small badge: *"✦ Commissions Open ✦"*.

---

## 🔍 Step 6: Optimize Image SEO (Alt Attributes) in `src/App.tsx`

Google Images is a primary discovery channel for art clients. Currently, images in `src/App.tsx` only use short titles (e.g., `alt={item.title}`).

### Recommended Update in `PortfolioCard`:
In `src/App.tsx` (around lines 1260):

**Before:**
```tsx
<img
  ref={imgRef}
  src={currentSrc}
  alt={item.title}
  ...
/>
```

**After:**
```tsx
<img
  ref={imgRef}
  src={currentSrc}
  alt={`Mittsunee Anime Art - ${item.title} (${item.category} commission)`}
  ...
/>
```

### Recommended Update in `Lightbox`:
In `src/App.tsx` (around lines 1012):

**After:**
```tsx
<motion.img
  ref={imgRef}
  key={item.id}
  src={item.image}
  alt={`Mittsunee Anime Illustration - ${item.title} - ${item.subtitle}`}
  ...
/>
```

---

## 🚀 Step 7: Testing & Verification Tools

Once deployed, verify your SEO implementation with these free official tools:

1. **Google Rich Results Test**:  
   Test your JSON-LD Schema: [https://search.google.com/test/rich-results](https://search.google.com/test/rich-results)
2. **OpenGraph Social Preview Test**:  
   Verify how your link renders on Discord, Facebook, WhatsApp: [https://opengraph.xyz/](https://opengraph.xyz/)
3. **Twitter / X Card Validator**:  
   Verify large preview cards: [https://cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator)
4. **Google Search Console**:  
   - Add property: `https://mittsunee.art/`
   - Submit sitemap: `https://mittsunee.art/sitemap.xml`
   - Request indexing for the homepage.
