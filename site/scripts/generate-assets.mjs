import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createCanvas } from '@napi-rs/canvas'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')

const TAG_FONT = '400 26px system-ui, -apple-system, sans-serif'
const TAG_LEFT = 'markdown-like text'
const TAG_RIGHT = 'HTML'
const TAG_GAP = 10
const ARROW_WIDTH = 14

function measureTextWidth(text, font) {
  const canvas = createCanvas(1, 1)
  const ctx = canvas.getContext('2d')
  ctx.font = font
  return ctx.measureText(text).width
}

function buildOgSvg() {
  const leftW = measureTextWidth(TAG_LEFT, TAG_FONT)
  const rightW = measureTextWidth(TAG_RIGHT, TAG_FONT)
  const totalW = leftW + TAG_GAP + ARROW_WIDTH + TAG_GAP + rightW
  const startX = (1200 - totalW) / 2
  const arrowX = startX + leftW + TAG_GAP
  const rightX = arrowX + ARROW_WIDTH + TAG_GAP
  const arrowY = 366

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <rect width="1200" height="630" fill="#ffffff"/>

  <text
    x="600"
    y="300"
    text-anchor="middle"
    font-family="ui-sans-serif, system-ui, -apple-system, sans-serif"
    font-size="108"
    font-weight="600"
    letter-spacing="-0.03em"
    fill="#111111"
  >vemi</text>

  <text
    x="${startX.toFixed(2)}"
    y="372"
    font-family="ui-sans-serif, system-ui, -apple-system, sans-serif"
    font-size="26"
    font-weight="400"
    letter-spacing="-0.01em"
    fill="#737373"
  >${TAG_LEFT}</text>

  <path
    d="M ${(arrowX).toFixed(2)} ${arrowY} H ${(arrowX + 10).toFixed(2)} M ${(arrowX + 6).toFixed(2)} ${arrowY - 6} L ${(arrowX + 12).toFixed(2)} ${arrowY} L ${(arrowX + 6).toFixed(2)} ${arrowY + 6}"
    stroke="#737373"
    stroke-width="2"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <text
    x="${rightX.toFixed(2)}"
    y="372"
    font-family="ui-sans-serif, system-ui, -apple-system, sans-serif"
    font-size="26"
    font-weight="400"
    letter-spacing="-0.01em"
    fill="#737373"
  >${TAG_RIGHT}</text>
</svg>
`
}

const ogSvg = buildOgSvg()
writeFileSync(join(publicDir, 'og.svg'), ogSvg)

const faviconSvg = readFileSync(join(publicDir, 'favicon.svg'))

await sharp(faviconSvg).resize(32, 32).png().toFile(join(publicDir, 'favicon-32.png'))
await sharp(faviconSvg).resize(180, 180).png().toFile(join(publicDir, 'apple-touch-icon.png'))
await sharp(Buffer.from(ogSvg)).resize(1200, 630).png().toFile(join(publicDir, 'og.png'))

console.log('Generated og.svg, favicon-32.png, apple-touch-icon.png, og.png')
