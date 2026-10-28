// Builds the Yana Honors wallet images from the card design in
// public/honors/yana-membership-card.png (plus the gold mark for icons):
//
//   public/honors/honors-lockup.png          "YANA Honors" logo, for the web card
//   public/honors/google-logo-yana.png       Google Wallet round logo: "YANA"
//   public/honors/google-wide-yana.png       Google Wallet wide logo across the top: "YANA"
//                                            (Google writes the program name, "Honors", under it)
//   server/assets/honors/icon*.png           Apple Wallet icon (lock screen, notifications)
//   server/assets/honors/logo*.png           Apple Wallet logo, top left: all a closed card shows
//
// The logo is cut from the design at fixed positions, so a new design with a
// different layout needs the boxes below updated. It is lifted off the
// design's own background and placed on the card colour (NAVY), which is also
// the wallets' background. Run after changing the design:
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

// Positions in the 1080 x 1920 design: the whole "YANA Honors" logo, and
// just "YANA" (the script "Honors" starts below row 744).
const LOCKUP = { left: 363, top: 648, width: 433, height: 151 }
const WORDMARK = { left: 363, top: 648, width: 330, height: 92 }

// Part of the design on a transparent background. Each pixel is a mix of the
// background and the gold, so its opacity is how far it has moved from the
// background towards the brightest gold; the colour is then un-mixed, keeping
// the gold's own gradient and soft edges.
async function piece(box: typeof LOCKUP) {
  const { data, info } = await sharp(DESIGN).extract(box).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const distance = (i: number) => Math.max(...DESIGN_BG.map((b, c) => Math.abs(data[i + c]! - b)))
  let full = 1
  for (let i = 0; i < data.length; i += 3) full = Math.max(full, distance(i))
  const out = Buffer.alloc(info.width * info.height * 4)
  for (let i = 0, o = 0; i < data.length; i += 3, o += 4) {
    // The design's background isn't perfectly even; differences this small
    // are background, not gold.
    const d = distance(i)
    const alpha = d <= NOISE ? 0 : Math.min(1, d / full)
    for (let c = 0; c < 3; c++) {
      out[o + c] = alpha ? Math.max(0, Math.min(255, Math.round(DESIGN_BG[c]! + (data[i + c]! - DESIGN_BG[c]!) / alpha))) : 0
    }
    out[o + 3] = Math.round(alpha * 255)
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer()
}

// The logo scaled to fit `fit`, centred on a canvas: navy, or transparent.
async function placed(input: Buffer, canvas: { width: number, height: number }, fit: { width: number, height: number }, background: string | null = NAVY) {
  const scaled = await sharp(input).resize({ ...fit, fit: 'inside', kernel: 'lanczos3' }).toBuffer()
  return sharp({ create: { ...canvas, channels: 4, background: background ?? { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: scaled, gravity: 'center' }])
    .png()
}

async function main() {
  const lockup = await piece(LOCKUP)
  const wordmark = await piece(WORDMARK)
  const mark = await sharp(join(PUBLIC, 'mark-gold.png')).png().toBuffer()

  // Web card logo, transparent so it sits on any navy.
  await sharp(lockup).toFile(join(PUBLIC, 'honors-lockup.png'))

  // Google: square logo at least 660 x 660 (masked to a circle, so the logo
  // keeps inside the middle), and the wide logo, a transparent 1280 x 400.
  await (await placed(wordmark, { width: 660, height: 660 }, { width: 460, height: 460 })).toFile(join(PUBLIC, 'google-logo-yana.png'))
  await (await placed(wordmark, { width: 1280, height: 400 }, { width: 1100, height: 300 }, null)).toFile(join(PUBLIC, 'google-wide-yana.png'))

  // Apple: icon 29pt; logo up to 160 x 50pt, transparent and exactly the
  // logo's size, since Apple sets it at the top left; @1x, @2x, @3x.
  for (const [scale, suffix] of [[1, ''], [2, '@2x'], [3, '@3x']] as const) {
    await (await placed(mark, { width: 29 * scale, height: 29 * scale }, { width: 20 * scale, height: 20 * scale })).toFile(join(APPLE, `icon${suffix}.png`))
    await sharp(lockup).resize({ width: 150 * scale, height: 48 * scale, fit: 'inside', kernel: 'lanczos3' }).png().toFile(join(APPLE, `logo${suffix}.png`))
  }
  console.log('Yana Honors images written to public/honors and server/assets/honors.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
