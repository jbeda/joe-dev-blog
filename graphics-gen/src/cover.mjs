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
import satori from 'satori'
import { renderPng, STATIC_DIR, CONTENT_DIR, h, getFonts } from './lib/render.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT  = join(__dirname, '..', '..')
const COVERS_DIR = join(STATIC_DIR, 'covers')

const W = 1200, H = 630
const PAD = 80
const TEAL = '#0D9488'
const SPEC_VERSION = '5'

// Cormorant Light (fonts/Cormorant-Light.ttf) OS/2 table: sTypoAscender=924, UPM=1000.
// The baseline of a line sits sTypoAscender/UPM * fontSize below the top of the em square.
const CORMORANT_ASCENDER_RATIO = 924 / 1000

// Gap from the baseline of the last title line (= bottom of capital letters) to the rule top.
const RULE_GAP = 28

// ── Typographic quotes ────────────────────────────────────────────────────────

function typographicQuotes(text) {
  text = text.replace(/(^|[\s([{])"/g, '$1\u201c')
  text = text.replace(/"/g, '\u201d')
  text = text.replace(/(^|[\s([{])'/g, '$1\u2018')
  text = text.replace(/'/g, '\u2019')
  return text
}

// ── Two-pass font sizing ───────────────────────────────────────────────────────

const FONT_SIZES = [120, 96, 72, 60, 52]
const TITLE_LINE_HEIGHT = 1.15

// Probe render: return actual layout height of the title element via onNodeDetected.
async function measureTitleHeight(title, fontSize) {
  let height = null
  await satori(
    h('div',
      { style: { width: W, height: H, display: 'flex', flexDirection: 'column', paddingLeft: PAD, paddingRight: PAD } },
      h('div',
        { id: 'TITLE_PROBE', style: { fontFamily: 'Cormorant', fontWeight: 300, fontSize, lineHeight: TITLE_LINE_HEIGHT, color: '#000' } },
        title
      )
    ),
    { width: W, height: H, fonts: getFonts(),
      onNodeDetected: (n) => { if (n.props?.id === 'TITLE_PROBE') height = n.height } }
  )
  return height ?? (fontSize * TITLE_LINE_HEIGHT)
}

// Try font sizes largest-first; return the first that fits in ≤3 lines.
async function selectFontSize(title) {
  for (const size of FONT_SIZES) {
    const titleHeight = await measureTitleHeight(title, size)
    const lines = Math.round(titleHeight / (size * TITLE_LINE_HEIGHT))
    if (lines <= 3) return { size, titleHeight }
  }
  const size = FONT_SIZES.at(-1)
  return { size, titleHeight: await measureTitleHeight(title, size) }
}

// ── Rule positioning (pure font metrics, no Pillow calibration) ────────────────

// The rule sits RULE_GAP px below the baseline of the last title line.
// Baseline offset from the bottom of the title CSS box:
//   halfLeading + ascender * fontSize - lineBoxH
//   = fontSize*(LH-1)/2 + ascenderRatio*fontSize - fontSize*LH
//   = fontSize * (ascenderRatio - (LH+1)/2)
// This is N-independent.
function computeRuleMargin(fontSize) {
  return Math.round(RULE_GAP + fontSize * (CORMORANT_ASCENDER_RATIO - (TITLE_LINE_HEIGHT + 1) / 2))
}

// ── Layout ────────────────────────────────────────────────────────────────────

function makeCoverNode({ title, description, logoDataUrl, titleSize, titleHeight, ruleMargin }) {
  const ruleTop = titleHeight + ruleMargin   // absolute position within hero block

  return h('div',
    { style: { width: W, height: H, background: '#F5F1EB', display: 'flex', flexDirection: 'column', position: 'relative' } },

    // Main area: hero block vertically centered
    h('div',
      { style: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: PAD, paddingRight: PAD, paddingTop: PAD, paddingBottom: PAD } },
      h('div',
        { style: { display: 'flex', flexDirection: 'column', marginTop: -20, position: 'relative' } },

        // ① Rule: FIRST in DOM so it renders behind the title text in SVG z-order.
        //   position:absolute takes it out of flow; the spacer below reserves its layout space.
        h('div', { style: { position: 'absolute', top: ruleTop, left: 0, width: 380, height: 6, background: TEAL } }),

        // ② Title: rendered ON TOP of the rule (later in DOM = higher z in SVG).
        //   Descender letters (g, y, p…) naturally extend through the rule, visible above it.
        h('div', { style: { fontFamily: 'Cormorant', fontWeight: 300, fontSize: titleSize, color: '#1F1F1F', lineHeight: TITLE_LINE_HEIGHT } }, title),

        // ③ Spacer: holds the layout space the rule would occupy if it were in-flow,
        //   so the description is positioned correctly below the rule.
        h('div', { style: { height: 6, marginTop: ruleMargin } }),

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

  const { size: titleSize, titleHeight } = await selectFontSize(title)
  const ruleMargin = computeRuleMargin(titleSize)

  const logoDataUrl = loadLogoDataUrl()
  const node = makeCoverNode({ title, description, logoDataUrl, titleSize, titleHeight, ruleMargin })
  const png  = await renderPng(node, W, H)

  mkdirSync(dirname(output), { recursive: true })
  writeFileSync(output, png)
  console.log(`✓ ${output}  (${titleSize}px, ruleMargin=${ruleMargin})`)

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
