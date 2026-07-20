#!/bin/bash
# Run from repo root. Links (or unlinks) SDK packages at the root only.
#
# Before you ever ran link with --cwd apps/trade, apps/trade had no node_modules
# and the app resolved @nadohq/client from the root. We run every link from the root so Bun
# keeps resolution at root; workspaces (trade, etc.) then keep resolving from root.
#
# Bun quirks this script works around:
#
# 1. Even when you run `bun link @nadohq/client` at the root, Bun updates root
#    node_modules correctly BUT also creates node_modules inside workspace packages
#    (e.g. apps/trade/node_modules) and installs the *unlinked* package there.
#    Resolution then prefers that local copy, so the app loads the published package
#    instead of your linked one. We fix that by removing the affected SDK packages
#    from each workspace node_modules after linking so apps resolve from root again.
#
# 2. Each `bun link X` call triggers a reinstall that overwrites previously linked
#    root symlinks with the published copy. We pass every SDK package to a single
#    `bun link` invocation so all symlinks are created in one install pass, and then
#    verify each root entry is actually a symlink.
#
# 3. The published @nadohq/client bundles its own copy of @nadohq/{indexer,engine,
#    trigger}-client and @nadohq/shared inside node_modules/@nadohq/client/node_modules.
#    If any nested copy of @nadohq/client gets reinstalled (in apps/* or packages/*),
#    Node will resolve those transitive imports from the bundled copy instead of the
#    root symlink, loading stale code. We clean every nested copy across both apps and
#    packages, so resolution always falls back to the root symlinks.
#
# Prereq: in your local nado-typescript-sdk repo, run `bun link-local` first
# to register it. Then run `bun run link-local-sdk` here.
#
# I asked about this behavior: https://github.com/oven-sh/bun/discussions/26513
#
# In base.json and nextjs.json these are to avoid TS errors when linking due to
# multiple instances of viem.
# "paths": {
#   "viem": ["../../node_modules/viem"],
#   "viem/*": ["../../node_modules/viem/*"]
# }

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

PACKAGES=(
  "@nadohq/shared"
  "@nadohq/engine-client"
  "@nadohq/indexer-client"
  "@nadohq/trigger-client"
  "@nadohq/client"
)

clean_nested_copies() {
  echo "> Removing nested @nadohq SDK copies from workspaces so resolution falls back to root"
  for parent in apps/*/ packages/*/; do
    [ -d "${parent}node_modules" ] || continue
    for package in "${PACKAGES[@]}"; do
      target="${parent}node_modules/${package}"
      if [ -e "$target" ] || [ -L "$target" ]; then
        echo "  rm -rf ${target}"
        rm -rf "$target"
      fi
    done
  done
}

verify_root_links() {
  echo "> Verifying root node_modules entries are symlinks"
  local missing=0
  for package in "${PACKAGES[@]}"; do
    target="node_modules/${package}"
    if [ ! -L "$target" ]; then
      echo "  ERROR: ${target} is not a symlink (linking did not stick)"
      missing=1
    else
      resolved="$(readlink "$target")"
      echo "  OK: ${target} -> ${resolved}"
    fi
  done
  if [ "$missing" -ne 0 ]; then
    echo
    echo "Some packages are not symlinked. Try:"
    echo "  1. In the SDK repo: bun link-local"
    echo "  2. Re-run: bun run link-local-sdk"
    exit 1
  fi
}

if [ -n "$UNLINK" ]; then
  # Note: `bun unlink {packageName}` is not implemented as of bun 1.3.9, so we
  # rely on `bun install` to restore the published packages at root and clean
  # out any nested copies the previous link operation may have left behind.
  clean_nested_copies
  echo "> bun install (restore deps)"
  bun install
else
  echo "> bun link ${PACKAGES[*]} (root, single install)"
  bun link "${PACKAGES[@]}"

  clean_nested_copies
  verify_root_links

  echo
  echo "Linked. Restart your dev server to pick up the new module resolution."
fi
