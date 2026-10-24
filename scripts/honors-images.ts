// Builds the Yana Honors wallet images from the card design in
// public/honors/yana-membership-card.png (plus the gold mark for icons):
//
//   public/honors/honors-lockup.png          "YANA Honors" logo, for the web card
//   public/honors/google-logo-honors.png     Google Wallet program logo (shown in a circle)
//   public/honors/google-hero-card.png       Google Wallet banner: "MEMBERSHIP CARD"
//   server/assets/honors/icon*.png           Apple Wallet icon (lock screen, notifications)
//   server/assets/honors/logo*.png           Apple Wallet logo, top left of the pass
//   server/assets/honors/strip*.png          Apple Wallet banner: "MEMBERSHIP CARD"
//
// The pieces are cut from the design at fixed positions, so a new design with
// a different layout needs the CROP boxes below updated. They are lifted off
// the design's own background and placed on the card colour (NAVY), which is
// also the wallets' background. Run after changing the design:
//
//   npm run honors:images
//
// Google caches images by address: when the look changes, give the Google
// files new names (and update google-wallet.ts) so existing cards refresh.
import { join, resolve } from 'node:path'
import sharp from 'sharp'

const ROOT = resolve(import.meta.dirname, '..')
const PUBLIC = join(ROOT, 'public/honors')
const APPLE = join(ROOT, 'server/assets/honors')
const DESIGN = join(PUBLIC, 'yana-membership-card.png')

// The card colour, and the background colour of the design file.
export const NAVY = '#0F1E2E'
const DESIGN_BG = [0x26, 0x3A, 0x53]
const NOISE = 4

// Positions in the 1748 x 1240 design.
const CROP = {
  lockup: { left: 702, top: 128, width: 371, height: 129 },
  title: { left: 335, top: 375, width: 1084, height: 68 }
}

// A piece of the design on a transparent background. Each pixel is a mix of
// the background and the gold, so its opacity is how far it has moved from
// the background towards the brightest gold in the piece; the colour is then
// un-mixed, keeping the gold's own gradient and soft edges.
async function piece(name: keyof typeof CROP) {
  const { data, info } = await sharp(DESIGN).extract(CROP[name]).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const distance = (i: number) => Math.max(...DESIGN_BG.map((b, c) => Math.abs(data[i + c]! - b)))
  let full = 1
  for (let i = 0; i < data.length; i += 3) full = Math.max(full, distance(i))
  const out = Buffer.alloc(info.width * info.height * 4)
  for (let i = 0, o = 0; i < data.length; i += 3, o += 4) {
    // The design's background isn't perfectly even (the pasted logo sits on a
    // shade one step off); differences that small are background, not gold.
    const d = distance(i)
    const alpha = d <= NOISE ? 0 : Math.min(1, d / full)
    for (let c = 0; c < 3; c++) {
      out[o + c] = alpha ? Math.max(0, Math.min(255, Math.round(DESIGN_BG[c]! + (data[i + c]! - DESIGN_BG[c]!) / alpha))) : 0
    }
    out[o + 3] = Math.round(alpha * 255)
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer()
}

// A piece scaled to `width` (or to fit `width` x `height`), centred on navy.
async function onNavy(input: Buffer, canvas: { width: number, height: number }, fit: { width: number, height?: number }) {
  const scaled = await sharp(input).resize({ ...fit, fit: 'inside', kernel: 'lanczos3' }).toBuffer()
  return sharp({ create: { ...canvas, channels: 3, background: NAVY } })
    .composite([{ input: scaled, gravity: 'center' }])
    .png()
}

async function main() {
  const lockup = await piece('lockup')
  const title = await piece('title')
  const mark = await sharp(join(PUBLIC, 'mark-gold.png')).png().toBuffer()

  // Web card logo, transparent so it sits on any navy.
  await sharp(lockup).extend({ top: 24, bottom: 24, left: 24, right: 24, background: { r: 0, g: 0, b: 0, alpha: 0 } }).toFile(join(PUBLIC, 'honors-lockup.png'))

  // Google: logo at least 660 x 660 (shown in a circle), hero 1032 x 336.
  await (await onNavy(lockup, { width: 660, height: 660 }, { width: 440 })).toFile(join(PUBLIC, 'google-logo-honors.png'))
  await (await onNavy(title, { width: 1032, height: 336 }, { width: 820 })).toFile(join(PUBLIC, 'google-hero-card.png'))

  // Apple: icon 29pt, logo up to 160 x 50pt, store card strip 375 x 123pt; @1x, @2x, @3x.
  for (const [scale, suffix] of [[1, ''], [2, '@2x'], [3, '@3x']] as const) {
    await (await onNavy(mark, { width: 29 * scale, height: 29 * scale }, { width: 20 * scale })).toFile(join(APPLE, `icon${suffix}.png`))
    await (await onNavy(lockup, { width: 150 * scale, height: 50 * scale }, { width: 140 * scale, height: 46 * scale })).toFile(join(APPLE, `logo${suffix}.png`))
    await (await onNavy(title, { width: 375 * scale, height: 123 * scale }, { width: 300 * scale })).toFile(join(APPLE, `strip${suffix}.png`))
  }
  console.log('Yana Honors images written to public/honors and server/assets/honors.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
