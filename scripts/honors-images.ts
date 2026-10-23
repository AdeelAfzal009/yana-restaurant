// Builds the Yana Honors wallet images from the brand files in public/honors:
//
//   public/honors/google-logo.png            Google Wallet program logo (shown in a circle)
//   public/honors/google-hero-<tier>.png     Google Wallet banner under the member details
//   server/assets/honors/icon*.png           Apple Wallet icon (lock screen, notifications)
//   server/assets/honors/logo*.png           Apple Wallet logo, top left of the pass
//   server/assets/honors/strip-<tier>*.png   Apple Wallet banner behind the top of the pass
//
// The banners have text in Montserrat, so they are drawn by headless Chrome;
// the rest is plain image work with sharp. Run after changing the brand files:
//
//   npm run honors:images        (CHROME_PATH=... if Chrome is not in /Applications)
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import sharp from 'sharp'

const ROOT = resolve(import.meta.dirname, '..')
const SRC = join(ROOT, 'public/honors')
const APPLE = join(ROOT, 'server/assets/honors')
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const NAVY = '#0C1D2F'
const TIERS = {
  silver: { label: 'SILVER', frame: 'rgba(211,216,224,0.35)', pill: 'border:1.5px solid #D3D8E0;color:#D3D8E0;' },
  platinum: { label: 'PLATINUM', frame: 'rgba(232,189,115,0.6)', pill: 'background:#E8BD73;color:#0C1D2F;' }
} as const
type Tier = keyof typeof TIERS

const src = (name: string) => join(SRC, name)

// Gold mark centred on navy, for square logos and icons.
async function markOnNavy(size: number, markShare: number) {
  const mark = await sharp(src('mark-gold.png')).resize({ width: Math.round(size * markShare), height: Math.round(size * markShare), fit: 'inside' }).toBuffer()
  return sharp({ create: { width: size, height: size, channels: 4, background: NAVY } })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
}

// Gold wordmark on transparent, inside Apple's 160x50pt logo box.
async function wordmark(scale: number) {
  return sharp(src('wordmark-gold.png'))
    .resize({ width: 150 * scale, height: 38 * scale, fit: 'inside' })
    .extend({ top: 6 * scale, bottom: 6 * scale, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
}

// Leather and corner pattern on the right, "YANA HONORS" and the tier pill on
// the left, framed like the card. Sizes follow the banner's height.
function bannerHtml(tier: Tier, width: number, height: number) {
  const t = TIERS[tier]
  const u = height / 336
  const pattern = pathToFileURL(src('corner-pattern.jpg')).href
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500&display=block" rel="stylesheet">
<style>
  html, body { margin: 0; width: ${width}px; height: ${height}px; overflow: hidden; background: ${NAVY}; }
  .b { position: relative; width: 100%; height: 100%; font-family: Montserrat, sans-serif; }
  .p { position: absolute; inset: 0; background: url("${pattern}") right bottom / auto ${height * 1.35}px no-repeat; }
  .p::before { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, ${NAVY} 30%, rgba(12,29,47,0.55) 55%, rgba(12,29,47,0) 75%); }
  .f { position: absolute; inset: ${14 * u}px; border: ${1.5 * u}px solid ${t.frame}; border-radius: ${14 * u}px; }
  .c { position: absolute; left: ${72 * u}px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: ${26 * u}px; }
  .h { color: #E8BD73; font-weight: 300; font-size: ${30 * u}px; letter-spacing: 0.42em; }
  .t { ${t.pill} font-weight: 400; font-size: ${30 * u}px; letter-spacing: 0.3em; padding: ${14 * u}px ${36 * u}px ${14 * u}px ${45 * u}px; border-radius: 999px; }
</style></head><body><div class="b"><div class="p"></div><div class="f"></div>
<div class="c"><div class="h">YANA HONORS</div><div class="t">${t.label}</div></div></div></body></html>`
}

function screenshot(html: string, width: number, height: number, out: string) {
  const dir = mkdtempSync(join(tmpdir(), 'honors-'))
  try {
    const page = join(dir, 'banner.html')
    writeFileSync(page, html)
    execFileSync(CHROME, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
      '--force-device-scale-factor=1', `--window-size=${width},${height}`, '--virtual-time-budget=8000',
      `--screenshot=${out}`, pathToFileURL(page).href
    ], { stdio: 'ignore' })
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

async function main() {
  // Google: logo at least 660x660, hero 1032x336.
  await (await markOnNavy(660, 0.5)).toFile(join(SRC, 'google-logo.png'))

  // Apple: icon 29pt, logo up to 160x50pt, store card strip 375x123pt; @1x, @2x, @3x.
  for (const [scale, suffix] of [[1, ''], [2, '@2x'], [3, '@3x']] as const) {
    await (await markOnNavy(29 * scale, 0.7)).toFile(join(APPLE, `icon${suffix}.png`))
    await (await wordmark(scale)).toFile(join(APPLE, `logo${suffix}.png`))
  }

  for (const tier of Object.keys(TIERS) as Tier[]) {
    screenshot(bannerHtml(tier, 1032, 336), 1032, 336, join(SRC, `google-hero-${tier}.png`))
    const strip3x = join(APPLE, `strip-${tier}@3x.png`)
    screenshot(bannerHtml(tier, 1125, 369), 1125, 369, strip3x)
    await sharp(strip3x).resize(750, 246).toFile(join(APPLE, `strip-${tier}@2x.png`))
    await sharp(strip3x).resize(375, 123).toFile(join(APPLE, `strip-${tier}.png`))
  }
  console.log('Yana Honors images written to public/honors and server/assets/honors.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
