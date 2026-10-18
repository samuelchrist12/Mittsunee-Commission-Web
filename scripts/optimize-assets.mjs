import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

async function optimizeAssets() {
  const publicDir = path.resolve('public')

  console.log('--- 1. Optimizing Original Character.png ---')
  const charInput = path.join(publicDir, 'Original Character.png')
  if (fs.existsSync(charInput)) {
    const origSize = fs.statSync(charInput).size
    console.log(`Original Character original size: ${(origSize / 1024).toFixed(1)} KB`)

    // Create 600px max webp and png (2x retina for 300px max display)
    const webpBuffer = await sharp(charInput)
      .resize({ width: 640, withoutEnlargement: true })
      .webp({ quality: 85, effort: 6 })
      .toBuffer()

    const pngBuffer = await sharp(charInput)
      .resize({ width: 640, withoutEnlargement: true })
      .png({ compressionLevel: 9, quality: 85 })
      .toBuffer()

    fs.writeFileSync(path.join(publicDir, 'Original Character.webp'), webpBuffer)
    console.log(`Original Character.webp created: ${(webpBuffer.length / 1024).toFixed(1)} KB`)
    
    // Also save an optimized PNG version
    fs.writeFileSync(path.join(publicDir, 'Original Character.optimized.png'), pngBuffer)
    console.log(`Original Character.optimized.png created: ${(pngBuffer.length / 1024).toFixed(1)} KB`)
  }

  console.log('\n--- 2. Optimizing Loading Eye.png ---')
  const eyeInput = path.join(publicDir, 'Loading Eye.png')
  if (fs.existsSync(eyeInput)) {
    const origSize = fs.statSync(eyeInput).size
    console.log(`Loading Eye original size: ${(origSize / 1024).toFixed(1)} KB`)

    const webpBuffer = await sharp(eyeInput)
      .resize({ width: 320, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()

    fs.writeFileSync(path.join(publicDir, 'Loading Eye.webp'), webpBuffer)
    console.log(`Loading Eye.webp created: ${(webpBuffer.length / 1024).toFixed(1)} KB`)
  }

  console.log('\n--- 3. Optimizing favicon.svg ---')
  const favInput = path.join(publicDir, 'favicon.svg')
  if (fs.existsSync(favInput)) {
    const origSize = fs.statSync(favInput).size
    console.log(`favicon.svg original size: ${(origSize / 1024).toFixed(1)} KB`)

    // Extract the embedded image or render to clean 64x64 PNG and SVG
    const favPng = await sharp(favInput)
      .resize(64, 64)
      .png({ compressionLevel: 9 })
      .toBuffer()

    fs.writeFileSync(path.join(publicDir, 'favicon.png'), favPng)
    console.log(`favicon.png created: ${(favPng.length / 1024).toFixed(1)} KB`)

    // Create a lean SVG favicon embedding the 64x64 PNG
    const base64Png = favPng.toString('base64')
    const leanSvg = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" rx="12" fill="white"/>
  <image width="48" height="48" href="data:image/png;base64,${base64Png}"/>
</svg>`
    fs.writeFileSync(path.join(publicDir, 'favicon-clean.svg'), leanSvg)
    console.log(`favicon-clean.svg created: ${(Buffer.byteLength(leanSvg) / 1024).toFixed(1)} KB`)
    // Overwrite favicon.svg with lean version so any existing links benefit directly
    fs.writeFileSync(path.join(publicDir, 'favicon.svg'), leanSvg)
  }

  console.log('\n--- 4. Optimizing Cursor.svg ---')
  const curInput = path.join(publicDir, 'Cursor.svg')
  if (fs.existsSync(curInput)) {
    const origSize = fs.statSync(curInput).size
    console.log(`Cursor.svg original size: ${(origSize / 1024).toFixed(1)} KB`)
    const curPng = await sharp(curInput).resize(48, 48).png().toBuffer()
    const base64Cur = curPng.toString('base64')
    const leanCurSvg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <image width="32" height="32" href="data:image/png;base64,${base64Cur}"/>
</svg>`
    fs.writeFileSync(path.join(publicDir, 'cursor-clean.svg'), leanCurSvg)
    fs.writeFileSync(path.join(publicDir, 'Cursor.svg'), leanCurSvg)
    fs.writeFileSync(path.join(publicDir, 'cursor.svg'), leanCurSvg)
    console.log(`cursor.svg optimized: ${(Buffer.byteLength(leanCurSvg) / 1024).toFixed(1)} KB`)
  }
}

optimizeAssets().catch(err => {
  console.error('Asset optimization error:', err)
  process.exit(1)
})
