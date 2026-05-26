#!/usr/bin/env node
/**
 * Generate a 1200×630 cover image for a blog post.
 *
 * Usage:
 *   node src/cover.mjs --post content/posts/my-post.md
 *   node src/cover.mjs --title "My Title" [--description "..."] --output static/covers/foo.png
 *   node src/cover.mjs --regen-all
 *
 * Run `task fonts` first to download brand fonts into fonts/.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderPng, STATIC_DIR, CONTENT_DIR, h } from './lib/render.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT  = join(__dirname, '..', '..')
const COVERS_DIR = join(STATIC_DIR, 'covers')

const W = 1200, H = 630
const PAD = 80
const TEAL = '#0D9488'
const SPEC_VERSION = '5'

// ── Typographic quotes ────────────────────────────────────────────────────────

function typographicQuotes(text) {
  text = text.replace(/(^|[\s([{])"/g, '$1“')
  text = text.replace(/"/g, '”')
  text = text.replace(/(^|[\s([{])'/g, '$1‘')
  text = text.replace(/'/g, '’')
  return text
}

// ── Title font size estimation ────────────────────────────────────────────────

// Calibrated for Cormorant SemiBold in 1040px (W - 2*PAD) content width.
const FONT_SIZES = [
  { size: 120, charsPerLine: 22 },
  { size: 96,  charsPerLine: 27 },
  { size: 72,  charsPerLine: 37 },
  { size: 60,  charsPerLine: 44 },
  { size: 52,  charsPerLine: 51 },
]

function estimateLines(text, cpl) {
  const words = text.split(/\s+/)
  let lines = 1, len = 0
  for (const w of words) {
    if (len > 0 && len + 1 + w.length > cpl) { lines++; len = w.length }
    else { len = len > 0 ? len + 1 + w.length : w.length }
  }
  return lines
}

function pickFontSize(title) {
  for (const { size, charsPerLine } of FONT_SIZES) {
    if (estimateLines(title, charsPerLine) <= 3) return size
  }
  return FONT_SIZES.at(-1).size
}

// ── Layout ────────────────────────────────────────────────────────────────────

function makeCoverNode({ title, description, logoDataUrl }) {
  const titleSize = pickFontSize(title)

  return h('div',
    { style: { width: W, height: H, background: '#F5F1EB', display: 'flex', flexDirection: 'column', position: 'relative' } },

    // Main area: hero block vertically centered
    h('div',
      { style: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: PAD, paddingRight: PAD, paddingTop: PAD, paddingBottom: PAD } },
      h('div',
        { style: { display: 'flex', flexDirection: 'column', marginTop: -20 } },
        h('div', { style: { fontFamily: 'Cormorant', fontWeight: 300, fontSize: titleSize, color: '#1F1F1F', lineHeight: 1.15 } }, title),
        h('div', { style: { width: 380, height: 6, background: TEAL, marginTop: 28 } }),
        description
          ? h('div', { style: { fontFamily: 'Nunito', fontWeight: 400, fontSize: 28, color: '#505050', marginTop: 18, maxWidth: 880, lineHeight: 1.45 } }, description)
          : null,
      ),
    ),

    // Bottom stripe
    h('div', { style: { height: 8, background: TEAL } }),

    // Signature block: absolute bottom-right above stripe
    h('div',
      { style: { position: 'absolute', bottom: PAD + 8, right: PAD, display: 'flex', flexDirection: 'column', alignItems: 'center' } },
      h('img', { src: logoDataUrl, width: 128, height: 128 }),
      h('div', { style: { fontFamily: 'Nunito', fontWeight: 400, fontSize: 24, color: '#6C6C6C', marginTop: 6 } }, 'joe.dev'),
      h('div', { style: { fontFamily: 'Nunito', fontWeight: 400, fontSize: 24, color: '#6C6C6C' } }, 'Joe Beda'),
    ),
  )
}

// ── Core generate ─────────────────────────────────────────────────────────────

function loadLogoDataUrl() {
  const logoPath = join(STATIC_DIR, 'apple-touch-icon.png')
  const data = readFileSync(logoPath).toString('base64')
  return `data:image/png;base64,${data}`
}

async function generateCover({ title, description, output, sourcePost }) {
  title = typographicQuotes(title)
  if (description) description = typographicQuotes(description)

  const logoDataUrl = loadLogoDataUrl()
  const node = makeCoverNode({ title, description, logoDataUrl })
  const png  = await renderPng(node, W, H)

  mkdirSync(dirname(output), { recursive: true })
  writeFileSync(output, png)
  console.log(`✓ ${output}`)

  const sidecarData = { spec_version: SPEC_VERSION, title, output }
  if (description) sidecarData.description = description
  if (sourcePost)  sidecarData.source_post = sourcePost
  const sidecar = output.replace(/\.png$/, '.cover.json')
  writeFileSync(sidecar, JSON.stringify(sidecarData, null, 2) + '\n')
  console.log(`  sidecar → ${sidecar}`)
}

// ── Frontmatter parser ────────────────────────────────────────────────────────

function parseFrontmatter(postPath) {
  const text = readFileSync(postPath, 'utf8')
  const m = text.match(/^\+\+\+([\s\S]*?)\+\+\+/)
  if (!m) throw new Error(`No TOML frontmatter found in ${postPath}`)
  const fm = m[1]
  const get = (key) => {
    // Try double-quoted first (allows inner single quotes), then single-quoted (allows inner double quotes)
    let r = fm.match(new RegExp(`\\b${key}\\s*=\\s*"([^"]*)"` ))
    if (!r) r = fm.match(new RegExp(`\\b${key}\\s*=\\s*'([^']*)'`))
    return r ? r[1] : null
  }
  const title = get('title')
  if (!title) throw new Error(`No title found in ${postPath}`)
  return { title, description: get('description') }
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const opt  = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null }

if (flag('--regen-all')) {
  const sidecars = readdirSync(COVERS_DIR)
    .filter(f => f.endsWith('.cover.json'))
    .map(f => join(COVERS_DIR, f))
  if (!sidecars.length) { console.error('No sidecar files found in', COVERS_DIR); process.exit(1) }
  for (const sidecar of sidecars) {
    const data = JSON.parse(readFileSync(sidecar, 'utf8'))
    console.log(`Regenerating: ${data.output}`)
    await generateCover({ title: data.title, description: data.description, output: data.output, sourcePost: data.source_post })
  }

} else if (opt('--post')) {
  const postPath = opt('--post')
  const { title, description } = parseFrontmatter(join(REPO_ROOT, postPath))
  const slug    = basename(postPath, '.md')
  const output  = opt('--output') || join(COVERS_DIR, `${slug}.png`)
  await generateCover({ title, description: opt('--description') ?? description, output, sourcePost: postPath })

} else if (opt('--title')) {
  const output = opt('--output')
  if (!output) { console.error('--output required with --title'); process.exit(1) }
  await generateCover({ title: opt('--title'), description: opt('--description'), output })

} else {
  console.error('Usage: node src/cover.mjs --post FILE | --title TEXT [--description TEXT] --output FILE | --regen-all')
  process.exit(1)
}
