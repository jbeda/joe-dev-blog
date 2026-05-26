#!/usr/bin/env node
/**
 * Generate favicon PNGs from Satori + resvg-js.
 *
 * Outputs:
 *   static/favicon-512.png       (source; used for publication-icon upload)
 *   static/favicon-180.png       → static/apple-touch-icon.png
 *   static/favicon-32x32.png
 *   static/favicon-16x16.png
 *
 * After running, the Taskfile rebuilds favicon.ico via ImageMagick:
 *   magick static/favicon-16x16.png static/favicon-32x32.png static/favicon.ico
 *
 * Design: uppercase J, Cormorant SemiBold, white on #0F766E teal, rounded square
 * (corner radius ~12%), +7% optical lift.
 *
 * Run `task fonts` first to download brand fonts into fonts/.
 */

import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderPng, STATIC_DIR, h } from './lib/render.mjs'

// Render at canonical 512px; resvg scales to each target size.
const CANONICAL = 512

function makeFaviconNode(size) {
  const radius = Math.round(size * 0.12)
  // +7% optical lift: pad the bottom so the J sits above true center.
  // With alignItems:'center' and paddingBottom:P, the element center is at
  // (size - P) / 2 from the top, shifting it up by P/2. We want P/2 = 7% of size.
  const lift = Math.round(size * 0.07)
  const fontSize = Math.round(size * 0.70)

  return h('div',
    {
      style: {
        width: size, height: size,
        background: '#0F766E',
        borderRadius: radius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: lift * 2,
      },
    },
    h('div',
      {
        style: {
          fontFamily: 'Cormorant',
          fontWeight: 600,
          fontSize,
          color: 'white',
          lineHeight: 1,
        },
      },
      'J',
    ),
  )
}

const OUTPUTS = [
  { filename: 'favicon-512.png',        size: 512 },
  { filename: 'apple-touch-icon.png',   size: 180 },
  { filename: 'favicon-32x32.png',      size:  32 },
  { filename: 'favicon-16x16.png',      size:  16 },
]

const node  = makeFaviconNode(CANONICAL)
const scale = (target) => target / CANONICAL

for (const { filename, size } of OUTPUTS) {
  const png = await renderPng(node, CANONICAL, CANONICAL, { scale: scale(size) })
  const dest = join(STATIC_DIR, filename)
  writeFileSync(dest, png)
  console.log(`✓ ${dest}  (${size}×${size})`)
}

console.log('\nNext: run `magick static/favicon-16x16.png static/favicon-32x32.png static/favicon.ico`')
console.log('      or run: task favicon')
