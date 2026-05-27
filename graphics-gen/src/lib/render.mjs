import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import opentype from '@shuding/opentype.js'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const GRAPHICS_GEN = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const REPO_ROOT    = join(GRAPHICS_GEN, '..')
export const FONTS_DIR   = join(REPO_ROOT, 'fonts')
export const STATIC_DIR  = join(REPO_ROOT, 'static')
export const CONTENT_DIR = join(REPO_ROOT, 'content')

function loadFont(filename) {
  const p = join(FONTS_DIR, filename)
  if (!existsSync(p)) {
    throw new Error(`Font not found: ${p}\nRun: task fonts`)
  }
  return readFileSync(p)
}

// Returns typographic ratios from the OS/2 table (all relative to unitsPerEm).
export function getFontMetrics(filename) {
  const font = opentype.parse(loadFont(filename).buffer)
  const upm  = font.unitsPerEm
  const os2  = font.tables.os2
  return {
    ascenderRatio:  os2.sTypoAscender            / upm,
    capHeightRatio: os2.sCapHeight               / upm,
    descenderRatio: Math.abs(os2.sTypoDescender) / upm,
  }
}

export function getFontAscenderRatio(filename) {
  return getFontMetrics(filename).ascenderRatio
}

const FONT_DEFS = [
  // 300 = Light; used for cover/og-home titles
  { name: 'Cormorant', weight: 300, style: 'normal', file: 'Cormorant-Light.ttf' },
  // 600 = SemiBold; used for the favicon J and wherever a heavy display weight is wanted
  { name: 'Cormorant', weight: 600, style: 'normal', file: 'Cormorant-SemiBold.ttf' },
  { name: 'Nunito',    weight: 300, style: 'normal', file: 'Nunito-Light.ttf' },
  { name: 'Nunito',    weight: 400, style: 'normal', file: 'Nunito-Regular.ttf' },
  { name: 'Nunito',    weight: 600, style: 'normal', file: 'Nunito-SemiBold.ttf' },
]

let _fonts = null
export function getFonts() {
  if (!_fonts) {
    _fonts = FONT_DEFS.map(({ name, weight, style, file }) => ({
      name, weight, style, data: loadFont(file),
    }))
  }
  return _fonts
}

export async function renderPng(node, width, height, { scale = 1 } = {}) {
  const svg = await satori(node, { width, height, fonts: getFonts() })
  const resvg = new Resvg(svg, scale === 1
    ? { fitTo: { mode: 'original' } }
    : { fitTo: { mode: 'width', value: Math.round(width * scale) } })
  return resvg.render().asPng()
}

// JSX-without-JSX helper. Null/undefined children are filtered out.
export function h(type, props, ...children) {
  const flat = children.flat(Infinity).filter(c => c != null)
  const ch = flat.length === 0 ? undefined : flat.length === 1 ? flat[0] : flat
  return { type, props: { ...props, children: ch } }
}
