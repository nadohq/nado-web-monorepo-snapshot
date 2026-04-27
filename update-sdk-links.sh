#!/bin/bash
# Run from repo root. Links (or unlinks) SDK packages at the root only.
#
# Before you ever ran link with --cwd apps/trade, apps/trade had no node_modules
# and the app resolved @nadohq/client from the root. We run every link from the root so Bun
# keeps resolution at root; workspaces (trade, etc.) then keep resolving from root.
#
# Bun quirk: even when you run "bun link @nadohq/client" at the root, Bun updates
# root node_modules correctly BUT also creates node_modules inside workspace packages
# (e.g. apps/trade/node_modules) and installs the *unlinked* package there. Resolution
# then prefers that local copy, so the app loads the published package instead of your
# linked one. We fix that by removing workspace node_modules after linking so apps
# resolve from root again.
#
# Prereq: in your local nado-typescript-sdk repo, run `bun link-local` first
# to register it. Then run `bun run link-local-sdk` here.
#
# If you previously ran link with --cwd and now have apps/trade/node_modules,
# remove it and reinstall to get back to "use root" behavior:
#   rm -rf apps/trade/node_modules && bun install
#
# I asked about this behavior: https://github.com/oven-sh/bun/discussions/26513
#
# In base.json and nextjs.json these are to avoid TS errors when linking due to
# multiple instances of viem.
# "paths": {
#   "viem": ["../../node_modules/viem"],
#   "viem/*": ["../../node_modules/viem/*"]
# }

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

PACKAGES=(
  "@nadohq/shared"
  "@nadohq/engine-client"
  "@nadohq/indexer-client"
  "@nadohq/trigger-client"
  "@nadohq/client"
)

if [ -n "$UNLINK" ]; then
  for PACKAGE in "${PACKAGES[@]}"; do
    echo "> bun unlink $PACKAGE (root)"
    bun unlink "$PACKAGE" 2>/dev/null || true
  done
  echo "> bun install (restore deps)"
  bun install
else
  for PACKAGE in "${PACKAGES[@]}"; do
    echo "> bun link $PACKAGE (root)"
    bun link "$PACKAGE" || true
  done
  echo "> Removing linked packages from workspace node_modules so apps resolve from root"
  for dir in apps/*/; do
    if [ -d "${dir}node_modules" ]; then
      for PACKAGE in "${PACKAGES[@]}"; do
        if [ -d "${dir}node_modules/${PACKAGE}" ]; then
          echo "  rm -rf ${dir}node_modules/${PACKAGE}"
          rm -rf "${dir}node_modules/${PACKAGE}"
        fi
      done
    fi
  done
fi
