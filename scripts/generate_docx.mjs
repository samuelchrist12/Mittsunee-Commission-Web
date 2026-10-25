import fs from 'node:fs'
import path from 'node:path'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  convertInchesToTwip,
} from 'docx'

// Colors (Theme: Pastel Sky Blue & Slate Navy)
const PRIMARY = '3763A3'      // Navy Sky Blue
const PRIMARY_LIGHT = '5589CC'// Accent Sky Blue
const BG_HEADER = 'EEF4FB'    // Soft Sky Background
const BORDER_COLOR = '9FC5E8' // Soft Border
const TEXT_DARK = '1E3A6A'    // Deep Blue-Black
const TEXT_MUTED = '5589CC'   // Subtle Blue Text
const BG_ZEBRA = 'F8FAFC'     // Alternate Row Shading
const GREEN_TAG = '15803D'    // Status Green

function createCell(text, options = {}) {
  const {
    bold = false,
    color = TEXT_DARK,
    size = 20, // 10pt
    align = AlignmentType.LEFT,
    bg = 'FFFFFF',
    width = null,
  } = options

  return new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: {
      top: convertInchesToTwip(0.08),
      bottom: convertInchesToTwip(0.08),
      left: convertInchesToTwip(0.12),
      right: convertInchesToTwip(0.12),
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text,
            bold,
            color,
            size,
            font: 'Segoe UI',
          }),
        ],
      }),
    ],
  })
}

function createHeaderCell(text, width = null, align = AlignmentType.LEFT) {
  return createCell(text, {
    bold: true,
    color: PRIMARY,
    size: 21,
    align,
    bg: BG_HEADER,
    width,
  })
}

function createSectionHeading(title, emoji = '') {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 140 },
    children: [
      new TextRun({
        text: `${emoji} ${title}`.trim(),
        bold: true,
        size: 32, // 16pt
        color: PRIMARY,
        font: 'Segoe UI',
      }),
    ],
  })
}

function createSubHeading(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 26, // 13pt
        color: PRIMARY_LIGHT,
        font: 'Segoe UI',
      }),
    ],
  })
}

function createBullet(text, number = null) {
  const prefix = number !== null ? `${number}. ` : '•  '
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    indent: { left: convertInchesToTwip(0.25) },
    children: [
      new TextRun({
        text: prefix,
        bold: true,
        color: PRIMARY_LIGHT,
        size: 21,
        font: 'Segoe UI',
      }),
      new TextRun({
        text,
        color: TEXT_DARK,
        size: 21,
        font: 'Segoe UI',
      }),
    ],
  })
}

function createCallout(text, title = 'IMPORTANT NOTE') {
  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: 'EEF4FB', type: ShadingType.CLEAR },
            margins: {
              top: convertInchesToTwip(0.12),
              bottom: convertInchesToTwip(0.12),
              left: convertInchesToTwip(0.15),
              right: convertInchesToTwip(0.15),
            },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              left: { style: BorderStyle.SINGLE, size: 24, color: PRIMARY_LIGHT },
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `✦ ${title}: `,
                    bold: true,
                    size: 20,
                    color: PRIMARY,
                    font: 'Segoe UI',
                  }),
                  new TextRun({
                    text,
                    size: 20,
                    color: TEXT_DARK,
                    font: 'Segoe UI',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  })
}

async function buildDocx() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Segoe UI',
            color: TEXT_DARK,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
            },
          },
        },
        children: [
          // ─── Document Title Header ───
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: '🌸 MITTSUNEE STUDIO 🌸',
                bold: true,
                size: 40, // 20pt
                color: PRIMARY,
                font: 'Segoe UI',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'Official Commission Price List & Terms of Service (ToS)',
                size: 24, // 12pt
                bold: true,
                color: PRIMARY_LIGHT,
                font: 'Segoe UI',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'Artist: @Mittsunee  |  Illustrator · Character Designer · Live2D Artist',
                size: 20,
                color: TEXT_MUTED,
                font: 'Segoe UI',
              }),
            ],
          }),

          // Info Callout Box
          createCallout(
            'Applicable for personal use & VTuber support. International payments via PayPal / VGen (USD), and Indonesian domestic payments via BCA / DANA / GoPay (IDR). Estimated turnaround: 1–3 weeks.',
            'COMMISSION STATUS: OPEN'
          ),
          new Paragraph({ spacing: { after: 200 } }),

          // ─── 1. PRICE LIST ───
          createSectionHeading('1. COMMISSION PRICE LIST', '🎨'),

          // A. Character Illustration
          createSubHeading('A. Character Illustration (🎨)'),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'High-quality character illustrations with clean lines, expressive poses, and soft vibrant coloring.',
                italics: true,
                size: 20,
                color: TEXT_MUTED,
              }),
            ],
          }),
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Shot Type', 4000),
                  createHeaderCell('Price USD ($)', 2500, AlignmentType.CENTER),
                  createHeaderCell('Price IDR (Rp)', 2500, AlignmentType.RIGHT),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Headshot', { width: 4000, bold: true }),
                  createCell('$35', { width: 2500, align: AlignmentType.CENTER, bold: true, color: PRIMARY }),
                  createCell('Rp 100,000', { width: 2500, align: AlignmentType.RIGHT, bold: true, color: PRIMARY }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Bust Up', { width: 4000, bold: true, bg: BG_ZEBRA }),
                  createCell('$60', { width: 2500, align: AlignmentType.CENTER, bold: true, color: PRIMARY, bg: BG_ZEBRA }),
                  createCell('Rp 150,000', { width: 2500, align: AlignmentType.RIGHT, bold: true, color: PRIMARY, bg: BG_ZEBRA }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Half Body', { width: 4000, bold: true }),
                  createCell('$75', { width: 2500, align: AlignmentType.CENTER, bold: true, color: PRIMARY }),
                  createCell('Rp 200,000', { width: 2500, align: AlignmentType.RIGHT, bold: true, color: PRIMARY }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Knee Up', { width: 4000, bold: true, bg: BG_ZEBRA }),
                  createCell('$85', { width: 2500, align: AlignmentType.CENTER, bold: true, color: PRIMARY, bg: BG_ZEBRA }),
                  createCell('Rp 250,000', { width: 2500, align: AlignmentType.RIGHT, bold: true, color: PRIMARY, bg: BG_ZEBRA }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Full Body', { width: 4000, bold: true }),
                  createCell('$100', { width: 2500, align: AlignmentType.CENTER, bold: true, color: PRIMARY }),
                  createCell('Rp 300,000', { width: 2500, align: AlignmentType.RIGHT, bold: true, color: PRIMARY }),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: 'Add-ons & Options (Character Illustration):', bold: true, size: 21, color: PRIMARY })] }),
          createBullet('Additional Character: +100% base price.'),
          createBullet('Background (Simple / White / Transparent): FREE.'),
          createBullet('Custom / Complex Background: +$10–$70 / Rp 50,000–250,000 (Negotiable).'),
          createBullet('VTuber Support (PFP / Thumbnail / Banner): FREE (Non-merchandise).'),
          createBullet('Commercial Use (For Asset / Merchandise / Monetized projects): +100% base price.'),
          createBullet('Rush Fee (2–4 Days): 2x Price.'),
          new Paragraph({ spacing: { after: 180 } }),

          // B. Chibi Style
          createSubHeading('B. Chibi Style (🌸)'),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'Cute and expressive chibi characters, perfect for icons, badges, emotes, and stickers.',
                italics: true,
                size: 20,
                color: TEXT_MUTED,
              }),
            ],
          }),
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Type', 4000),
                  createHeaderCell('Price USD ($)', 2500, AlignmentType.CENTER),
                  createHeaderCell('Price IDR (Rp)', 2500, AlignmentType.RIGHT),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Full Body Chibi', { width: 4000, bold: true }),
                  createCell('$30', { width: 2500, align: AlignmentType.CENTER, bold: true, color: PRIMARY }),
                  createCell('Rp 100,000', { width: 2500, align: AlignmentType.RIGHT, bold: true, color: PRIMARY }),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: 'Add-ons (Chibi Style):', bold: true, size: 21, color: PRIMARY })] }),
          createBullet('Additional Character: +100% base price.'),
          createBullet('Background (Simple / Transparent): FREE.'),
          createBullet('VTuber Support (PFP / Thumbnail / Banner): FREE (Non-merchandise).'),
          createBullet('Commercial Use (For Asset / Merchandise): +100% base price.'),
          new Paragraph({ spacing: { after: 180 } }),

          // C. SKEB Style
          createSubHeading('C. SKEB Style — Surprise Commission (✨)'),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: 'Surprise commissions in signature style. Pose, vibe, and composition are left to the artist (No design revisions).',
                italics: true,
                size: 20,
                color: TEXT_MUTED,
              }),
            ],
          }),
          createCallout('Concept and composition decided by artist. Design revisions are not included for SKEB commissions.', 'SKEB RULE'),
          new Paragraph({ spacing: { after: 120 } }),
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Shot Type', 4000),
                  createHeaderCell('Price USD ($)', 2500, AlignmentType.CENTER),
                  createHeaderCell('Price IDR (Rp)', 2500, AlignmentType.RIGHT),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Headshot', { width: 4000, bold: true }),
                  createCell('$30', { width: 2500, align: AlignmentType.CENTER, bold: true, color: PRIMARY }),
                  createCell('Rp 85,000', { width: 2500, align: AlignmentType.RIGHT, bold: true, color: PRIMARY }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Bust Up', { width: 4000, bold: true, bg: BG_ZEBRA }),
                  createCell('$40', { width: 2500, align: AlignmentType.CENTER, bold: true, color: PRIMARY, bg: BG_ZEBRA }),
                  createCell('Rp 120,000', { width: 2500, align: AlignmentType.RIGHT, bold: true, color: PRIMARY, bg: BG_ZEBRA }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Half Body', { width: 4000, bold: true }),
                  createCell('$50', { width: 2500, align: AlignmentType.CENTER, bold: true, color: PRIMARY }),
                  createCell('Rp 160,000', { width: 2500, align: AlignmentType.RIGHT, bold: true, color: PRIMARY }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Full Body', { width: 4000, bold: true, bg: BG_ZEBRA }),
                  createCell('$60', { width: 2500, align: AlignmentType.CENTER, bold: true, color: PRIMARY, bg: BG_ZEBRA }),
                  createCell('Rp 220,000', { width: 2500, align: AlignmentType.RIGHT, bold: true, color: PRIMARY, bg: BG_ZEBRA }),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: 'Add-ons (SKEB):', bold: true, size: 21, color: PRIMARY })] }),
          createBullet('Background: FREE (Artist choice).'),
          createBullet('Additional Character: +100% base price.'),
          createBullet('Rush Fee (2–4 Days): 2x Price.'),
          new Paragraph({ spacing: { after: 180 } }),

          // D. Live2D Model Art
          createSubHeading('D. Live2D Model Art — Ready to Rig (🎭)'),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: 'Layer-separated PSD model art, cut and ready for riggers. (Art Only — Rigging NOT included).',
                italics: true,
                size: 20,
                color: TEXT_MUTED,
              }),
            ],
          }),
          createCallout('Delivered as organized layered PSD ready for rigging. Rigging service is NOT included.', 'LIVE2D MODEL ART'),
          new Paragraph({ spacing: { after: 120 } }),
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Model Art Type', 4000),
                  createHeaderCell('Price USD ($)', 2500, AlignmentType.CENTER),
                  createHeaderCell('Price IDR (Rp)', 2500, AlignmentType.RIGHT),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Half Body Model Art', { width: 4000, bold: true }),
                  createCell('$180', { width: 2500, align: AlignmentType.CENTER, bold: true, color: PRIMARY }),
                  createCell('Rp 850,000', { width: 2500, align: AlignmentType.RIGHT, bold: true, color: PRIMARY }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Full Body Model Art', { width: 4000, bold: true, bg: BG_ZEBRA }),
                  createCell('$300', { width: 2500, align: AlignmentType.CENTER, bold: true, color: PRIMARY, bg: BG_ZEBRA }),
                  createCell('Rp 1,500,000', { width: 2500, align: AlignmentType.RIGHT, bold: true, color: PRIMARY, bg: BG_ZEBRA }),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { before: 140, after: 80 }, children: [new TextRun({ text: 'Add-ons & Extra Parts (Live2D):', bold: true, size: 21, color: PRIMARY })] }),
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Extra Item', 4000),
                  createHeaderCell('Price USD ($)', 2500, AlignmentType.CENTER),
                  createHeaderCell('Price IDR (Rp)', 2500, AlignmentType.RIGHT),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Character Design by Artist', { width: 4000 }),
                  createCell('+$80', { width: 2500, align: AlignmentType.CENTER, bold: true, color: PRIMARY }),
                  createCell('+Rp 350,000', { width: 2500, align: AlignmentType.RIGHT, bold: true, color: PRIMARY }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Additional Outfit', { width: 4000, bg: BG_ZEBRA }),
                  createCell('+$60', { width: 2500, align: AlignmentType.CENTER, bold: true, color: PRIMARY, bg: BG_ZEBRA }),
                  createCell('+Rp 250,000', { width: 2500, align: AlignmentType.RIGHT, bold: true, color: PRIMARY, bg: BG_ZEBRA }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Additional Hairstyle', { width: 4000 }),
                  createCell('+$40', { width: 2500, align: AlignmentType.CENTER, bold: true, color: PRIMARY }),
                  createCell('+Rp 150,000', { width: 2500, align: AlignmentType.RIGHT, bold: true, color: PRIMARY }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Extra Expression / Hand Toggle', { width: 4000, bg: BG_ZEBRA }),
                  createCell('+$15', { width: 2500, align: AlignmentType.CENTER, bold: true, color: PRIMARY, bg: BG_ZEBRA }),
                  createCell('+Rp 50,000', { width: 2500, align: AlignmentType.RIGHT, bold: true, color: PRIMARY, bg: BG_ZEBRA }),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 240 } }),

          // ─── 2. TERMS OF SERVICE ───
          createSectionHeading('2. TERMS OF SERVICE (ToS)', '📜'),

          // 01. Commercial Usage
          createSubHeading('01. Commercial Usage'),
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('License Tier', 2500),
                  createHeaderCell('Usage Scope', 4500),
                  createHeaderCell('Fee', 2000, AlignmentType.RIGHT),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Tier 0: Personal', { width: 2500, bold: true }),
                  createCell('Private use, wallpapers, personal social avatars', { width: 4500 }),
                  createCell('Included', { width: 2000, align: AlignmentType.RIGHT, bold: true, color: PRIMARY }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Tier 1: VTuber Support', { width: 2500, bold: true, bg: BG_ZEBRA }),
                  createCell('PFP, streaming thumbnail, banner (non-merchandise)', { width: 4500, bg: BG_ZEBRA }),
                  createCell('FREE ✦', { width: 2000, align: AlignmentType.RIGHT, bold: true, color: GREEN_TAG, bg: BG_ZEBRA }),
                ],
              }),
              new TableRow({
                children: [
                  createCell('Tier 2: Commercial Asset', { width: 2500, bold: true }),
                  createCell('Merchandise, company assets, monetized content', { width: 4500 }),
                  createCell('+100% Base', { width: 2000, align: AlignmentType.RIGHT, bold: true, color: PRIMARY }),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { before: 120, after: 60 } }),
          createBullet('Orders default to Tier 0 (Personal Use) / Tier 1 (VTuber Support).', 1),
          createBullet('VTuber Support is FREE for PFP, Thumbnails, and Banners as long as it is not sold as merchandise.', 2),
          createBullet('For Asset / Merchandise / Monetized projects, commercial use is +100% of the base price.', 3),
          createBullet('Please state any commercial intentions when sending your inquiry.', 4),
          new Paragraph({ spacing: { after: 180 } }),

          // 02. General Guidelines
          createSubHeading('02. General Guidelines'),
          createBullet('I reserve the right to decline commissions that do not align with my style.', 1),
          createBullet('Please do not push for rush turnarounds outside agreed milestones.', 2),
          createBullet('Clear references help avoid misunderstandings and delays.', 3),
          createBullet('Communication should remain respectful. Harassment will lead to immediate cancellation.', 4),
          createBullet('Finished pieces may be featured in my public portfolio unless an NDA was agreed upon.', 5),
          createBullet('AI images can be shared as visual mood references, but will not be directly copied.', 6),
          createBullet('I do not accept: explicit minor NSFW, non-consensual real person art, or extreme gore.', 7),
          new Paragraph({ spacing: { after: 180 } }),

          // 03. Workflow & Revisions
          createSubHeading('03. Workflow & Revisions'),
          createBullet('Submit your request through VGen or direct inquiry channels (Instagram, X, Email).', 1),
          createBullet('I review each request and reply within 1 to 3 business days.', 2),
          createBullet('A 50% deposit is required before work starts on the initial sketch.', 3),
          createBullet('Rough sketches will be shared for feedback before lineart and coloring.', 4),
          createBullet('Two revision rounds are included at the sketch phase. Edits after lineart incur extra fees.', 5),
          createBullet('Full-resolution art files are delivered once the remaining balance is settled.', 6),
          createBullet('Estimated turnaround is 1 to 3 weeks depending on queue position and complexity.', 7),
          new Paragraph({ spacing: { after: 180 } }),

          // 04. Copyright & Attribution
          createSubHeading('04. Copyright & Attribution'),
          createBullet('The artist retains intellectual property and copyright over the artwork.', 1),
          createBullet('You receive license rights corresponding to your selected usage tier.', 2),
          createBullet('Please credit @Mittsunee whenever posting or showcasing the artwork.', 3),
          createBullet('Do not claim the illustration as your own creation.', 4),
          createBullet('Do not crop, remove, or obscure the artist watermark without written agreement.', 5),
          createBullet('Reselling raw project files or minting the art as NFTs is strictly prohibited.', 6),
          new Paragraph({ spacing: { after: 180 } }),

          // 05. Payments, Refunds & Rush Orders
          createSubHeading('05. Payments, Refunds & Rush Orders'),
          createBullet('Accepted payment options: PayPal (international) and GoPay, DANA, or BCA (Indonesia).', 1),
          createBullet('A 50% deposit is required to begin. The final 50% is due upon completion.', 2),
          createBullet('Rush orders (completed within 7 days): +30% of the total quote (2–4 days rush: 2x price).', 3),
          createBullet('Cancellations before sketching starts receive a full refund minus transfer fees.', 4),
          createBullet('Cancellations during the sketch phase qualify for a 50% refund.', 5),
          createBullet('No refunds are available once lineart has started.', 6),
          createBullet('A full refund will be provided if a commission is cancelled on my end.', 7),
          new Paragraph({ spacing: { after: 240 } }),

          // ─── 3. CONTACT & ORDER ───
          createSectionHeading('3. OFFICIAL ORDER & CONTACT CHANNELS', '📬'),
          createBullet('Official Website: https://mittsunee.art'),
          createBullet('VGen (Primary Order Platform): https://vgen.co/Mittsunee'),
          createBullet('X / Twitter: https://x.com/Mittsunee'),
          createBullet('Instagram: https://www.instagram.com/mittsunee/'),
          createBullet('Facebook: https://www.facebook.com/gazzela.chi'),
          createBullet('Official Email: mittsune112@gmail.com'),
          new Paragraph({ spacing: { before: 200, after: 100 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '✦ Thank you for supporting Mittsunee! ✦',
                italics: true,
                bold: true,
                size: 20,
                color: PRIMARY,
              }),
            ],
          }),
        ],
      },
    ],
  })

  // Paths
  const targetDir1 = 'C:\\Users\\Mueee\\Documents\\Mueee\\AI\\Mittsunee'
  const targetDir2 = 'C:\\Users\\Mueee\\Documents\\Mueee\\Website\\MittsuneeWeb'

  const file1 = path.join(targetDir1, 'Mittsunee_PriceList_and_ToS.docx')
  const file2 = path.join(targetDir2, 'Mittsunee_PriceList_and_ToS.docx')

  const buffer = await Packer.toBuffer(doc)

  fs.writeFileSync(file1, buffer)
  console.log(`✅ Word document regenerated (English): ${file1}`)

  fs.writeFileSync(file2, buffer)
  console.log(`✅ Word document regenerated (English): ${file2}`)
}

buildDocx().catch(err => {
  console.error('Error generating docx:', err)
  process.exit(1)
})
