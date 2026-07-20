---
name: upgrade-dependencies
description: >
  Use this skill whenever upgrading dependencies in nado-web-monorepo. Trigger on phrases like
  "upgrade deps", "update dependencies", "bump packages", or any mention of updating package
  versions. This skill covers the full workflow: auditing current versions, fetching changelogs,
  identifying breaking changes, upgrading in two separate commits (major then minor), and opening
  a PR that highlights deferred upgrades and follow-ups.
---

# Upgrade Dependencies

This skill walks through the complete process of upgrading dependencies in `nado-web-monorepo`.
The key principles are:

- **Two separate commits**: major build-toolchain deps first, then everything else — easier to
  roll back if a toolchain upgrade breaks the build.
- **Changelog-driven**: fetch release notes for every upgrade, flag breaking changes and relevant
  bug fixes in the PR.
- **Deferred upgrades in the PR**: packages skipped due to breaking changes are called out
  explicitly — not silently dropped.

---

## Pinned packages — never upgrade without SDK sync

These packages are coupled to the SDK and must be upgraded in a **coordinated PR with the SDK
team**. Upgrading them independently risks type mismatches or runtime breakage:

| Package | Reason |
|---|---|
| `viem` | Pinned by `@nadohq/shared` peer dep; must match SDK's version |
| `wagmi` | Pinned by `@nadohq/shared` peer dep; must match SDK's version |
| `bignumber.js` | Pinned by `@nadohq/shared` peer dep at exact version; mismatch causes `_isBigNumber` type errors |
| `@privy-io/wagmi` | Pins a specific `viem` peer dep version. Upgrading without a matching `viem` bump causes type conflicts |
| `@privy-io/react-auth` | Depends on `@privy-io/wagmi`; must stay in lockstep with it and the SDK's viem/wagmi versions |

**Before upgrading any Privy package**, check its peer dependencies:

```bash
npm view @privy-io/wagmi@<version> peerDependencies
```

If the `viem` peer dep doesn't match the catalog version, **do not upgrade** — flag it for
follow-up with the SDK team in the PR.

If the SDK upgrades `viem`/`wagmi`, the web monorepo must follow in a coordinated PR that also
bumps `@privy-io/wagmi` and `@privy-io/react-auth` to versions compatible with the new `viem`.

---

## Node.js and `@types/node`

- `@types/node` must only be upgraded to versions matching the current **LTS** Node line
  (see `.nvmrc`). Odd-numbered Node releases (25, 27, …) are non-LTS — never target them.
- Example: if `.nvmrc` is `v24.x`, stay on `@types/node@24.x`.

---

## Where to add new packages

When a dependency upgrade requires adding a **new package** to `package.json` (e.g. replacing a
deprecated ESLint plugin), add it in the **deepest** `package.json` that covers its usage:

| Usage scope | Add to |
|---|---|
| Single app | `apps/<app>/package.json` |
| Single package | `packages/<package>/package.json` |
| Multiple apps/packages | Root `package.json` `catalog` |

This keeps concerns local and avoids polluting the root catalog with app-specific deps. Only use
the root catalog when the package is shared across two or more apps or packages.

---

## Phase 1 — Audit, categorise, and open PR

Run the audit using the minimum release age from `bunfig.toml`:

```bash
bun outdated --minimum-release-age=$(grep -oE 'minimumReleaseAge = [0-9]+' bunfig.toml | grep -oE '[0-9]+')
```

The `--minimum-release-age` flag (in seconds) filters out versions published within the last N
seconds, matching the `minimumReleaseAge` in `bunfig.toml` (259200 = 3 days). This ensures only
eligible versions are shown.

For each catalog entry, check the latest available version:

```bash
npm view <package-name> version
```

Categorise into:

1. **Major build-toolchain deps** — TypeScript, Next.js, ESLint ecosystem, Turborepo, and any
   packages that must match their version (e.g. `@next/*` must match `next`).
2. **Minor deps** — everything else (UI libs, data libs, dev tools, types).

Open a **draft PR** targeting `staging` at this point. Subsequent commits will update it:

```bash
gh pr create \
  --draft \
  --base staging \
  --title "Upgrade dependencies <date>" \
  --body "$(cat <<'EOF'
## Summary

Dependency upgrade cycle. Two commits:
1. **Major build-toolchain** — <list packages>
2. **Minor deps** — <list categories>

### Upgrades

| Package | Old | New | Notes |
|---|---|---|---|
| [pkg](https://www.npmjs.com/package/pkg) | <old> | [<new>](<release-url>) | [breaking](<url>): <summary> / [fix](<url>): <summary> / — |

### Deferred

| Package | Current | Latest | Reason |
|---|---|---|---|
| [pkg](https://www.npmjs.com/package/pkg) | <current> | <latest> | [breaking](<url>): <reason> |

### Follow-ups

- [ ] [pkg](https://www.npmjs.com/package/pkg): <action needed when conditions are met>

> **Add links wherever possible** to simplify human review:
> - Package names → link to their npm page
> - "New" version → link to the release/changelog on GitHub
> - Notes/Reason → link to the specific breaking change, migration guide, CVE, or issue

## Checklist

- [ ] `bun install --frozen-lockfile` succeeds
- [ ] `bun typecheck` passes
- [ ] `bun lint:fix` passes
- [ ] No pinned packages (viem, wagmi, bignumber.js, @privy-io/*) were upgraded
- [ ] `@types/node` stays on the LTS line matching `.nvmrc`
- [ ] Deferred upgrades are listed above with rationale
- [ ] `bunfig.toml` `minimumReleaseAgeExcludes` was not modified
EOF
)"
```

### minimumReleaseAge rule

`bunfig.toml` enforces a 3-day minimum release age (`minimumReleaseAge = 259200`). This is a
safety guard, not a bottleneck to work around.

**Never modify `minimumReleaseAgeExcludes`** to bypass the age check. The excludes list exists
solely for packages that require immediate installs regardless of age (e.g. `@nadohq/*` internal
packages published during SDK releases).

If the latest version of a package isn't listed by `bun outdated`:

1. **Try the latest eligible version** — check older versions for one published ≥ 3 days ago:
   ```bash
   npm view <package-name> time --json
   ```
2. **If no eligible version exists** — defer the upgrade and add it to the "Deferred" table with
   reason "published < 3 days ago, retry next cycle".

---

## Phase 2 — Fetch changelogs and assess risk

For every package being upgraded, fetch the changelog or release notes. Focus on:

- **Breaking changes** — will they require code changes in our codebase?
- **Bug fixes** — are any relevant to issues we've encountered?

For semver **major** bumps, read the migration guide carefully. Search the codebase for usage
of deprecated/removed APIs before deciding to upgrade:

```bash
rg "<removed-api>" --include="*.ts,*.tsx"
```

If a major bump requires significant code migration, **defer it** — add it to the PR's "Deferred"
table with the breaking change summary and create a follow-up item.

Update the PR's "Upgrades" table with notes (breaking changes, relevant bug fixes) as you go.

---

## Phase 3 — Upgrade major build-toolchain deps (Commit 1)

### What counts as "major"

Packages where a version change can break the build or type-check across the entire monorepo:

| Package | Why |
|---|---|
| `typescript` | Type system changes affect entire codebase |
| `next` | Build/runtime changes affect all Next.js apps |
| `eslint`, `typescript-eslint`, `@typescript-eslint/eslint-plugin` | Lint rules affect code quality checks |
| `eslint-config-next`, `eslint-config-turbo` | Part of ESLint ecosystem |
| `turbo` | Build orchestration |
| `@next/bundle-analyzer`, `@next/third-parties` | Must match `next` version |

### Steps

1. Update the `catalog` section in root `package.json`
2. Update the `overrides` section if applicable
3. Update any non-catalog packages that must match (e.g. `@next/third-parties` in `apps/trade/package.json`)
4. Run `bun install` to update the lockfile
5. Verify:

```bash
bun typecheck
bun lint:fix
```

6. Commit:

```bash
git commit -m "chore(deps): upgrade major build toolchain dependencies

next <old> → <new>
typescript-eslint <old> → <new>
turbo <old> → <new>
..."
```

---

## Phase 4 — Upgrade minor deps (Commit 2)

### Steps

1. Update the remaining `catalog` entries and root `devDependencies`
2. Run `bun install`
3. Fix any type errors caused by the upgrades. When an upgrade changes generic types to
   require explicit type arguments, try the narrowest option first and only fall back to
   wider types if narrower ones fail at call sites:
   1. **Single concrete type** — works when the typed object is consumed by only one component
   2. **Union of concrete types** — works at the declaration site but may fail at call sites
   If this still fails, **do not use `any`**, instead Defer the upgrade of the package(s) with
   a note detailing which types are causing issue.
4. Verify:

```bash
bun typecheck
bun lint:fix
```

5. Commit — include a **Deferred** section for packages intentionally skipped:

```bash
git commit -m "chore(deps): upgrade minor dependencies

<list upgraded packages by category>

Deferred (breaking changes requiring code migration):
- <package> <old> → <new> (<reason>)
..."
```

6. Mark the PR as ready for review:

```bash
gh pr ready <pr-number>
```

---

## Quick reference — key file paths

| Purpose | Path |
|---|---|
| Root package.json (catalog + devDeps) | `package.json` |
| Bunfig (minimumReleaseAge config) | `bunfig.toml` |
| Trade app package.json | `apps/trade/package.json` |
| ESLint config | `packages/eslint-config-custom/index.js` |
| ESLint config package.json | `packages/eslint-config-custom/package.json` |
