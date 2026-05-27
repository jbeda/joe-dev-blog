# static/ — Claude Notes

## Favicon Regeneration

Favicon design spec (colors, shape, typography) lives in `BRAND.md`.

### Figma export frames
Export frames live in the Brand Book at canvas y=4000, named `favicon-export/512`, `/180`, `/32`, `/16`:
- Node IDs: `21:2` (512px), `21:4` (180px), `21:6` (32px), `21:8` (16px)
- File key: `FE0YU473kXl1u9I6uHn29r`

### Exporting from Figma
Use `get_screenshot` + curl (not `exportAsync` for large images — base64 truncates).
For the apple-touch-icon (180px) which needs a transparent background, use `exportAsync` inside `use_figma` since it's small enough:

```js
// In use_figma — export one frame as base64 PNG
const node = figma.getNodeById("21:4"); // e.g. 180px
const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
let binary = '';
for (let i = 0; i < bytes.length; i += 8192)
  binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
return JSON.stringify({ data: btoa(binary) });
```

Decode and save: `echo "<base64>" | base64 -d > static/apple-touch-icon.png`

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
