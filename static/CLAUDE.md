# static/ — Claude Notes

## Favicon Regeneration

Favicon design spec (colors, shape, typography) lives in `BRAND.md`.
Favicons are generated from satori — run `task favicon` to regenerate all sizes.

For Figma export technique (needed for diagrams or other design work), see memory `feedback-figma-png-export`.

### Rebuilding the ICO
After updating the PNGs:
```bash
magick static/favicon-16x16.png static/favicon-32x32.png static/favicon.ico
```

### Keeping Bluesky in sync
After updating `static/apple-touch-icon.png`, re-upload the publication icon:
```bash
task publication-icon
```
