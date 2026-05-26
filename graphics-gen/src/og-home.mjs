#!/usr/bin/env node
/**
 * Generate the home page OG image (static/og-home.png).
 *
 * Design: large favicon centrepiece, "joe.dev" in Cormorant, teal rule,
 * "Joe Beda" byline, bottom stripe. Fully centred layout.
 *
 * Usage: node src/og-home.mjs [--output path]
 * Run `task fonts` first to download brand fonts into fonts/.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderPng, STATIC_DIR, h } from './lib/render.mjs'

const W = 1200, H = 630
const TEAL = '#0D9488'

const logoPath    = join(STATIC_DIR, 'apple-touch-icon.png')
const logoBase64  = readFileSync(logoPath).toString('base64')
const logoDataUrl = `data:image/png;base64,${logoBase64}`

function makeOgHomeNode() {
  return h('div',
    {
      style: {
        width: W, height: H,
        background: '#F5F1EB',
        display: 'flex',
        flexDirection: 'column',
      },
    },

    // Main area: centred block nudged -15px above true centre
    h('div',
      {
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          // Nudge block slightly above centre (paddingBottom shifts centre up by half its value)
          paddingBottom: 30,
        },
      },
      // Favicon
      h('img', { src: logoDataUrl, width: 220, height: 220 }),
      // "joe.dev" title
      h('div',
        {
          style: {
            fontFamily: 'Cormorant',
            fontWeight: 300,
            fontSize: 108,
            color: '#1F1F1F',
            lineHeight: 1,
            marginTop: 28,
          },
        },
        'joe.dev',
      ),
      // Teal rule
      h('div', { style: { width: 280, height: 6, background: TEAL, marginTop: 28 } }),
      // "Joe Beda" byline
      h('div',
        {
          style: {
            fontFamily: 'Nunito',
            fontWeight: 400,
            fontSize: 28,
            color: '#6C6C6C',
            marginTop: 20,
          },
        },
        'Joe Beda',
      ),
    ),

    // Bottom stripe
    h('div', { style: { height: 8, background: TEAL } }),
  )
}

const args   = process.argv.slice(2)
const outIdx = args.indexOf('--output')
const output = outIdx >= 0 ? args[outIdx + 1] : join(STATIC_DIR, 'og-home.png')

const png = await renderPng(makeOgHomeNode(), W, H)
writeFileSync(output, png)
console.log(`✓ ${output}`)
