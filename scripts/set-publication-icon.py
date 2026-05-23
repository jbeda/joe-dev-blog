#!/usr/bin/env python3
"""
Upload a PNG as the site.standard.publication icon blob and patch the record.

TODO: File an issue on https://tangled.org/stevedylan.dev/sequoia asking Sequoia
to support publication icon management natively (e.g. via sequoia.json or a CLI
command), so this script is no longer needed.

Usage:
    task publication-icon            # use static/apple-touch-icon.png (default)
    task publication-icon -- --icon static/my-icon.png

Requires env vars (auto-loaded by Taskfile dotenv):
    ATP_IDENTIFIER   — your ATproto handle (e.g. h.olysh.it)
    ATP_APP_PASSWORD — ATproto app password
"""

import json
import os
import sys
from pathlib import Path
from urllib import error, parse, request

IDENTIFIER   = os.environ.get("ATP_IDENTIFIER")
APP_PASSWORD = os.environ.get("ATP_APP_PASSWORD")
SEQUOIA_JSON = Path("sequoia.json")

if not IDENTIFIER:
    sys.exit("Error: ATP_IDENTIFIER not set")
if not APP_PASSWORD:
    sys.exit("Error: ATP_APP_PASSWORD not set")
if not SEQUOIA_JSON.exists():
    sys.exit("Error: sequoia.json not found — run from repo root")

PUBLICATION_URI = json.loads(SEQUOIA_JSON.read_text()).get("publicationUri")
if not PUBLICATION_URI:
    sys.exit("Error: publicationUri not set in sequoia.json")

# Parse rkey from at:// URI
RKEY = PUBLICATION_URI.split("/")[-1]

# Icon file: default to apple-touch-icon.png, override with --icon flag
icon_path = Path("static/apple-touch-icon.png")
for i, arg in enumerate(sys.argv[1:]):
    if arg == "--icon" and i + 2 < len(sys.argv):
        icon_path = Path(sys.argv[i + 2])
if not icon_path.exists():
    sys.exit(f"Icon file not found: {icon_path}")


def get(url, token=None):
    req = request.Request(url)
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    with request.urlopen(req) as r:
        return json.loads(r.read())


def post_json(url, data, token=None):
    req = request.Request(url, data=json.dumps(data).encode(), method="POST")
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    with request.urlopen(req) as r:
        return json.loads(r.read())


def upload_blob(url, data, mime_type, token):
    req = request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", mime_type)
    req.add_header("Authorization", f"Bearer {token}")
    with request.urlopen(req) as r:
        return json.loads(r.read())


# ── 1. Resolve DID → PDS URL ─────────────────────────────────────────────────

print(f"Resolving handle: {IDENTIFIER}")
resolved = get(f"https://bsky.social/xrpc/com.atproto.identity.resolveHandle"
               f"?handle={parse.quote(IDENTIFIER)}")
did = resolved["did"]
print(f"DID: {did}")

plc = get(f"https://plc.directory/{parse.quote(did)}")
pds_url = next(
    s["serviceEndpoint"]
    for s in plc.get("service", [])
    if s.get("type") == "AtprotoPersonalDataServer"
)
print(f"PDS: {pds_url}")

# ── 2. Authenticate ───────────────────────────────────────────────────────────

try:
    session = post_json(
        f"{pds_url}/xrpc/com.atproto.server.createSession",
        {"identifier": IDENTIFIER, "password": APP_PASSWORD},
    )
except error.HTTPError as e:
    sys.exit(f"Authentication failed: {e}")

token = session["accessJwt"]
repo_did = session["did"]
print(f"Authenticated as {repo_did}\n")

# ── 3. Upload icon blob ───────────────────────────────────────────────────────

icon_data = icon_path.read_bytes()
print(f"Uploading icon: {icon_path} ({len(icon_data)} bytes)")

blob_result = upload_blob(
    f"{pds_url}/xrpc/com.atproto.repo.uploadBlob",
    icon_data,
    "image/png",
    token,
)
blob_ref = blob_result["blob"]
print(f"Blob uploaded: {blob_ref['ref']['$link']}")

# ── 4. Fetch current publication record ──────────────────────────────────────

print(f"\nFetching publication record: {PUBLICATION_URI}")
current = get(
    f"{pds_url}/xrpc/com.atproto.repo.getRecord"
    f"?repo={parse.quote(repo_did)}&collection=site.standard.publication&rkey={RKEY}",
    token,
)
record = current["value"]
print(f"Current record keys: {list(record.keys())}")

# ── 5. Patch record with icon blob ───────────────────────────────────────────

record["icon"] = blob_ref
print(f"\nPatching record with icon blob...")

result = post_json(
    f"{pds_url}/xrpc/com.atproto.repo.putRecord",
    {
        "repo": repo_did,
        "collection": "site.standard.publication",
        "rkey": RKEY,
        "record": record,
    },
    token,
)
print(f"✓ Updated: {result['uri']}")
print(f"  CID: {result['cid']}")
