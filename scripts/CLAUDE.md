# scripts/ — Claude Notes

## Python Tooling

All Python utilities live here. Dependencies are declared in `scripts/requirements.txt`
and the venv is kept at `scripts/.venv/` (gitignored) — nothing Python-related lands at the repo root.

**Why this layout:** The macOS system Python (`/usr/bin/python3`) is 3.9 and installs packages
globally. We use **Python 3.13 via brew** and a project-local venv for isolation.

**Setup** (runs automatically as a dependency of `task fonts` and all script tasks):
```bash
task scripts:setup   # creates scripts/.venv/ and installs from requirements.txt
```

Or manually:
```bash
uv venv --python 3.13 scripts/.venv
uv pip install --python scripts/.venv/bin/python3 -r scripts/requirements.txt
```

**Nunito static weight instances** — Satori crashes on variable TTFs, so `task fonts` uses
`fonttools.varLib.instancer` to extract discrete weight files from `Nunito-variable.ttf`:

| File | Weight |
|---|---|
| `fonts/Nunito-Light.ttf` | 300 |
| `fonts/Nunito-Regular.ttf` | 400 |
| `fonts/Nunito-SemiBold.ttf` | 600 |

**Adding a new Python dependency:** add it to `scripts/requirements.txt`, then run `task scripts:setup`.
