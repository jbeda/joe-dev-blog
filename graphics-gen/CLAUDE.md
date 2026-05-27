# graphics-gen/ — Claude Notes

## Cover Image Generation

Cover image visual spec (colors, fonts, layer layout) lives in `BRAND.md`.
The cover generator is `graphics-gen/src/cover.mjs`.

### When branding changes

1. Update the colour/font constants at the top of `graphics-gen/src/cover.mjs` to match `BRAND.md`.
2. Bump `SPEC_VERSION` in the same file (currently `"6"`).
3. Run `task covers-regen` to rebuild all covers from their sidecars.
4. Re-publish affected posts so Sequoia uploads the new blobs to ATproto.

### Node.js path
Node.js is managed via nvm and is not on PATH in non-interactive shells. Use the full path:
```bash
~/.nvm/versions/node/v24.15.0/bin/node graphics-gen/src/cover.mjs
```
Or use `task cover` / `task covers-regen` which handle this automatically.
