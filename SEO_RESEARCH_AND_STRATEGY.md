# 🌸 Mittsunee Web — SEO Research & Optimization Strategy

Dokumen riset komprehensif Search Engine Optimization (SEO) untuk website komisi & portofolio **Mittsunee** (`mittsuneeweb`).

---

## 🎯 1. Ringkasan Eksekutif & Target Persona

- **Brand / Identitas**: **Mittsunee** (@Mittsunee) — Illustrator, Character Designer, & Live2D Model Artist.
- **Niche**: Anime Art, Soft Pastel Aesthetic, Chibi, VTuber Character Art, SKEB.
- **Dua Target Pasar Utama (Dual-Market)**:
  1. **Pasar Internasional**: Klien VTuber, streamer Twitch/YouTube, fans anime dari US/Eropa/Jepang dengan daya beli USD via **VGen / PayPal**.
  2. **Pasar Domestik Indonesia**: Klien lokal, komunitas anime/VTuber lokal, pembuat konten dengan transaksi IDR via **BCA / DANA / GoPay / QRIS**.

---

## 🔑 2. Riset Kata Kunci (Keyword Research Matrix)

Mesin pencari (Google & Bing) memprioritaskan kata kunci dengan **High Commercial Intent** (niat beli/order yang tinggi), bukan hanya kata kunci umum seperti *"anime art"*.

### A. Pasar Internasional (English Keywords)

| Kategori | Kata Kunci Target (Primary & Long-Tail) | Search Intent | Tingkat Persaingan |
| :--- | :--- | :---: | :---: |
| **Core Brand** | `Mittsunee art`, `Mittsunee commissions`, `Mittsunee illustrator` | Navigational | Rendah |
| **Commission Core** | `anime art commissions open`, `hire anime character illustrator`, `anime commission price list` | Commercial | Menengah |
| **Chibi Art** | `chibi commission open`, `cute anime chibi artist for hire`, `custom chibi emotes stream` | Transactional | Menengah |
| **Live2D / VTuber** | `Live2D model art commission`, `ready to rig vtuber model art`, `vtuber character design illustrator` | Transactional | Menengah - Tinggi |
| **Niche Aesthetic** | `pastel anime illustrator`, `soft pastel character design anime`, `skeb style commission` | Informational / Commercial | Rendah |
| **Platform-Linked** | `VGen anime artist Mittsunee`, `safe anime commissions VGen` | Navigational | Rendah |

---

### B. Pasar Domestik Indonesia (Indonesian Keywords)

| Kategori | Kata Kunci Target (Primary & Long-Tail) | Search Intent |
| :--- | :--- | :---: |
| **Jasa Gambar Anime** | `jasa gambar anime`, `komisi gambar anime indonesia`, `jasa ilustrasi anime terpercaya` | Transactional |
| **Chibi & Emote** | `jasa gambar chibi anime`, `komisi chibi murah berkualitas`, `jasa buat stiker emote stream` | Transactional |
| **Model VTuber** | `jasa desain karakter vtuber`, `komisi model vtuber ready to rig`, `artis gambar vtuber indonesia` | Commercial |
| **Harga & Portofolio** | `harga komisi gambar anime`, `daftar harga commission art`, `open commission art indonesia` | Commercial |

---

## 🛠️ 3. Audit On-Page SEO Website Saat Ini (`index.html`)

Setelah mengaudit file `index.html` yang ada di proyek, berikut temuan dan area yang perlu ditingkatkan:

### ✅ Yang Sudah Ada:
1. Tag `<title>` dasar: `Mittsunee | Art & Commission Portfolio`.
2. Meta description dasar.
3. Preconnect font Google (Fredoka).
4. Meta viewport standar.

### ⚠️ Yang Belum Ada / Perlu Ditingkatkan:
1. **Open Graph Image (`og:image`)**: Belum ada banner artwork preview. Ketika link web dibagikan di WhatsApp, Discord, X, atau Facebook, tidak muncul kartu gambar banner yang estetik!
2. **Twitter Card Tags**: Belum ada `twitter:card`, `twitter:site`, `twitter:title`, `twitter:description`, `twitter:image`. Padahal Twitter/X adalah sarang klien utama Mittsunee.
3. **Canonical Tag**: Belum ada `<link rel="canonical" href="..." />`, penting untuk mencegah isu duplicate URL di Google.
4. **Structured Data JSON-LD (`schema.org`)**: Belum terpasang. Mesin pencari belum bisa membaca metadata rich snippet berupa profil artis, rating, kisaran harga penawaran komisi, dan link media sosial resmi.
5. **Image SEO & Alt Text**: Atribut `alt` pada galeri portofolio masih sederhana (hanya judul singkat), belum memuat kata kunci deskriptif ramah Google Images.
6. **Robots.txt & Sitemap.xml**: Belum ada file `robots.txt` dan `sitemap.xml` di folder `public/` agar Googlebot mengindeks seluruh halaman secara terstruktur.

---

## 📋 4. Rekomendasi Solusi & Blueprint Kode SEO

### A. Template Meta Tag & Open Graph Optimal untuk `index.html`

```html
<!-- Primary Meta Tags -->
<title>Mittsunee | Anime Art Commissions, Chibi & Live2D Model Art</title>
<meta name="title" content="Mittsunee | Anime Art Commissions, Chibi & Live2D Model Art" />
<meta name="description" content="Official commission portfolio of Mittsunee (@Mittsunee). High-quality anime character illustrations, chibi art, and ready-to-rig Live2D model art. Open for international & Indonesian commissions." />
<meta name="keywords" content="Mittsunee, anime art commission, jasa gambar anime, chibi commission, live2d model art, character designer, vgen artist, komisi vtuber" />
<meta name="author" content="Mittsunee" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://mittsunee.com/" />

<!-- Open Graph / Facebook / Discord -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://mittsunee.com/" />
<meta property="og:title" content="🌸 Mittsunee | Art & Commission Portfolio" />
<meta property="og:description" content="Anime Character Illustrations, Chibi, & Live2D Model Art. Explore gallery, price list (USD/IDR), and commission guidelines." />
<meta property="og:image" content="https://mittsunee.com/og-banner.png" />
<meta property="og:site_name" content="Mittsunee Studio" />

<!-- Twitter / X Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@Mittsunee" />
<meta name="twitter:creator" content="@Mittsunee" />
<meta name="twitter:title" content="🌸 Mittsunee | Anime Art & Commission Portfolio" />
<meta name="twitter:description" content="Character Art · Chibi · Live2D Model Art. Commissions Open on VGen & direct channels." />
<meta name="twitter:image" content="https://mittsunee.com/og-banner.png" />
```

---

### B. Structured Data JSON-LD (`VisualArtist` + `Offer` Schema)

Tambahkan skrip ini di `<head>` pada `index.html` untuk memicu *Rich Snippet* di hasil pencarian Google:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VisualArtist",
  "name": "Mittsunee",
  "alternateName": "Tasya",
  "url": "https://mittsunee.com",
  "image": "https://mittsunee.com/Original%20Character.webp",
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
    "Digital Art"
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
        "name": "Anime Character Illustration (Headshot to Full Body)",
        "price": "35.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": "https://vgen.co/Mittsunee"
      },
      {
        "@type": "Offer",
        "name": "SKEB Style Surprise Commission",
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

### C. File `robots.txt` & `sitemap.xml`

#### 1. `public/robots.txt`:
```txt
User-agent: *
Allow: /
Disallow: /cyela
Disallow: /#cyela

Sitemap: https://mittsunee.com/sitemap.xml
```

#### 2. `public/sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mittsunee.com/</loc>
    <lastmod>2026-10-25</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

---

## 🖼️ 5. Image SEO (Google Images Traffic Engine)

1. **Slug Nama File Gambar**: Gunakan penamaan gambar deskriptif:
   - `futsuri-original-character-anime-illustration-mittsunee.webp`
2. **Descriptive Alt Text**:
   - `alt="Mittsunee Anime Art - Futsuri (Original Character commission)"`
3. **Core Web Vitals & WebP**: Tetap gunakan format WebP dan CDN rendering Supabase agar score LCP (Largest Contentful Paint) tetap hijau.

---

## 🌐 6. Sinergi Off-Page & Social SEO

1. **Backlink Profil Resmi**: Tautkan link website di bio Twitter/X, Instagram, VGen, Facebook, Pixiv, Cara.
2. **Anchor Text Consistency**: Selalu gunakan branding yang konsisten: `"Mittsunee - Anime Illustrator & Live2D Artist"`.
