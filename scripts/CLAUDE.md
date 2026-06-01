# scripts/ — Claude Notes

## Python Tooling

All Python utilities live here. They run ephemerally via **`uv run`** — there is no managed
venv to create or maintain (`uv` provisions an interpreter and any dependencies per invocation,
cached globally). Nothing Python-related lands at the repo root.

- **Stdlib-only scripts** (`delete-orphaned-records.py`, `set-publication-icon.py`) run with
  `uv run --no-project python scripts/<name>.py` — see the `atproto-*` / `publication-icon`
  tasks in `Taskfile.yml`.
- **`fonttools`** (the one third-party dependency, pinned in `scripts/requirements.txt`) is
  pulled in only for the font-instancing step of `task fonts`, via
  `uv run --with-requirements scripts/requirements.txt --no-project python …`.

`--no-project` keeps `uv` from looking for a `pyproject.toml`; we don't have one.

**Nunito static weight instances** — Satori crashes on variable TTFs, so `task fonts` uses
`fonttools.varLib.instancer` to extract discrete weight files from `Nunito-variable.ttf`:

| File | Weight |
|---|---|
| `fonts/Nunito-Light.ttf` | 300 |
| `fonts/Nunito-Regular.ttf` | 400 |
| `fonts/Nunito-SemiBold.ttf` | 600 |

**Adding a new Python dependency:** add it to `scripts/requirements.txt` and make sure the
task that needs it invokes `uv run --with-requirements scripts/requirements.txt …` (the
stdlib-only `--no-project` tasks don't read it).
