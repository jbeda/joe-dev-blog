#!/usr/bin/env python3
"""
List (and optionally delete) orphaned site.standard.document records on your ATproto PDS.

A record is "orphaned" if its at:// URI doesn't appear in any post's frontmatter
or in .sequoia-state.json — meaning Sequoia no longer tracks it.

Usage:
    python3 scripts/delete-orphaned-records.py            # dry run: list only
    python3 scripts/delete-orphaned-records.py --delete   # delete orphaned records

Requires env vars:
    ATP_IDENTIFIER   — your ATproto handle (e.g. h.olysh.it)
    ATP_APP_PASSWORD — ATproto app password
"""

import json
import os
import re
import sys
from pathlib import Path
from urllib import error, parse, request

IDENTIFIER   = os.environ.get("ATP_IDENTIFIER")
APP_PASSWORD = os.environ.get("ATP_APP_PASSWORD")
CONTENT_DIR  = Path("content/posts")
STATE_FILE   = Path(".sequoia-state.json")
SEQUOIA_JSON = Path("sequoia.json")
COLLECTION   = "site.standard.document"
DRY_RUN      = "--delete" not in sys.argv

if not IDENTIFIER:
    sys.exit("Error: ATP_IDENTIFIER not set")
if not APP_PASSWORD:
    sys.exit("Error: ATP_APP_PASSWORD not set")
if not SEQUOIA_JSON.exists():
    sys.exit("Error: sequoia.json not found — run from repo root")

PUBLICATION_URI = json.loads(SEQUOIA_JSON.read_text()).get("publicationUri")
if not PUBLICATION_URI:
    sys.exit("Error: publicationUri not set in sequoia.json")


def get(url, token=None):
    req = request.Request(url)
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    with request.urlopen(req) as r:
        return json.loads(r.read())


def post(url, data, token=None):
    req = request.Request(url, data=json.dumps(data).encode(), method="POST")
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    with request.urlopen(req) as r:
        return json.loads(r.read())


# ── 1. Resolve DID → PDS URL ─────────────────────────────────────────────────

print(f"Resolving handle: {IDENTIFIER}")
try:
    resolved = get(f"https://bsky.social/xrpc/com.atproto.identity.resolveHandle"
                   f"?handle={parse.quote(IDENTIFIER)}")
    did = resolved["did"]
except Exception as e:
    sys.exit(f"Could not resolve handle: {e}")

print(f"DID: {did}")

try:
    plc = get(f"https://plc.directory/{parse.quote(did)}")
    pds_url = next(
        s["serviceEndpoint"]
        for s in plc.get("service", [])
        if s.get("type") == "AtprotoPersonalDataServer"
    )
except Exception as e:
    sys.exit(f"Could not resolve PDS from DID: {e}")

print(f"PDS: {pds_url}")

# ── 2. Authenticate ───────────────────────────────────────────────────────────

try:
    session = post(
        f"{pds_url}/xrpc/com.atproto.server.createSession",
        {"identifier": IDENTIFIER, "password": APP_PASSWORD},
    )
except error.HTTPError as e:
    sys.exit(f"Authentication failed: {e}")

token = session["accessJwt"]
repo_did = session["did"]
print(f"Authenticated as {repo_did}\n")

# ── 3. List all records in the collection ────────────────────────────────────

records = []
cursor = None
while True:
    url = (f"{pds_url}/xrpc/com.atproto.repo.listRecords"
           f"?repo={parse.quote(repo_did)}&collection={COLLECTION}&limit=100")
    if cursor:
        url += f"&cursor={parse.quote(cursor)}"
    result = get(url, token)
    batch = result.get("records", [])
    records.extend(batch)
    cursor = result.get("cursor")
    if not cursor or not batch:
        break

print(f"Records on PDS ({COLLECTION}): {len(records)}")

# ── 4. Narrow to this publication only ───────────────────────────────────────

# Show first record's value keys to diagnose field name if filter produces nothing
if records and "--debug" in sys.argv:
    print("DEBUG first record value:", json.dumps(records[0].get("value", {}), indent=2))

PUB_FIELDS = ("site", "publicationUri", "publication")  # "site" is the actual field name
def record_pub(r):
    v = r.get("value", {})
    for f in PUB_FIELDS:
        if f in v:
            return v[f]
    return None

this_pub = [r for r in records if record_pub(r) == PUBLICATION_URI]
skipped  = len(records) - len(this_pub)
print(f"Publication URI: {PUBLICATION_URI}")
print(f"Belonging to this publication: {len(this_pub)}"
      + (f"  ({skipped} from other publications — skipped)" if skipped else ""))

if not this_pub and records:
    sample_pub = record_pub(records[0])
    print(f"\nWARNING: No records matched the publication URI.")
    print(f"  First record's publication field: {sample_pub!r}")
    print(f"  Re-run with --debug to see the full record value.")
    sys.exit(1)

# ── 5. Collect known atUris from frontmatter + state file ───────────────────

known_uris: set[str] = set()

for md in CONTENT_DIR.glob("*.md"):
    for m in re.finditer(r'atUri\s*=\s*"(at://[^"]+)"', md.read_text()):
        known_uris.add(m.group(1))

if STATE_FILE.exists():
    state = json.loads(STATE_FILE.read_text())
    for entry in state.get("posts", {}).values():
        if uri := entry.get("atUri"):
            known_uris.add(uri)

print(f"Known atUris (frontmatter + state): {len(known_uris)}\n")

# ── 6. Identify orphans (within this publication only) ───────────────────────

orphaned = [r for r in this_pub if r["uri"] not in known_uris]

if not orphaned:
    print("✓ No orphaned records found.")
    sys.exit(0)

print(f"Orphaned records ({len(orphaned)}):")
for r in orphaned:
    title = (r.get("value", {}).get("title")
             or r.get("value", {}).get("content", {}).get("slug")
             or "?")
    print(f"  {r['uri']}  ({title})")

# ── 7. Delete (or report dry run) ───────────────────────────────────────────

if DRY_RUN:
    print("\nDry run — pass --delete to remove these records.")
    sys.exit(0)

print("\nDeleting...")
for r in orphaned:
    rkey = r["uri"].split("/")[-1]
    try:
        post(
            f"{pds_url}/xrpc/com.atproto.repo.deleteRecord",
            {"repo": repo_did, "collection": COLLECTION, "rkey": rkey},
            token,
        )
        print(f"  ✓ Deleted {r['uri']}")
    except error.HTTPError as e:
        print(f"  ✗ Failed {r['uri']}: {e}")

print("Done.")
