---
name: unlock-mainnet-markets
description: >
  Use this skill whenever promoting one or more markets from testnet-only to live on mainnet.
  Trigger on phrases like "unlock markets on mainnet", "release markets to mainnet", "go live with
  markets", "promote testnet markets to mainnet", or any mention of making hidden mainnet markets
  visible. This skill covers: removing markets from the mainnet hidden list, marking them as new,
  and wiring up the in-app release notification.
---

# Unlock Mainnet Markets

This skill walks through the complete process of making one or more markets — which were previously
listed on testnet but hidden on mainnet — visible and featured on mainnet in `nado-web-monorepo`.
Handle all markets in a single branch and PR.

> **Release date is required.** If the user has not provided a release date, stop and ask before
> proceeding. The date drives the disclosure key used for the notification and must be exact.

---

## Prerequisites — gather before starting

| Field | Details |
|---|---|
| Product ID(s) | the numeric IDs currently in the mainnet hidden list |
| Release date | the date these markets go live on mainnet — required for the notification key |
| Mainnet token address(es) | spot markets only — the deployed Ink mainnet ERC-20 address for each market (see Phase 4) |

Confirm each product ID is currently in the `inkMainnet` set in
`packages/react-client/context/metadata/consts/hiddenProductIdsByChainEnv.ts` before touching
anything else.

---

## Phase 1 — Branch setup

Create a dedicated branch off `staging`:

```bash
git checkout staging && git pull
git checkout -b agent/<SYMBOLS>-mainnet-release
```

---

## Phase 2 — Remove from the mainnet hidden list

Open:
```
packages/react-client/context/metadata/consts/hiddenProductIdsByChainEnv.ts
```

Remove the product ID entries (and their symbol comments) for each market being released from the
`inkMainnet` set. Leave `inkTestnet` and `local` untouched.

Before:
```ts
inkMainnet: new Set([
  ...DELISTED_PRODUCT_IDS,
  NLP_PRODUCT_ID,
  // AVAX
  64,
  // LTC
  76,
]),
```

After (releasing AVAX and LTC):
```ts
inkMainnet: new Set([
  ...DELISTED_PRODUCT_IDS,
  NLP_PRODUCT_ID,
]),
```

---

## Phase 3 — Mark as new on mainnet

Open:
```
packages/react-client/context/metadata/consts/newProductIdsByChainEnv.ts
```

Replace both `inkMainnet` and `inkTestnet` sets with **only** the product IDs being released now
— remove any IDs from previous release cycles. `local` stays empty.

```ts
export const NEW_PRODUCT_IDS_BY_CHAIN_ENV: Record<ChainEnv, Set<number>> = {
  inkMainnet: new Set([<productId1>, <productId2>]),
  inkTestnet: new Set([<productId1>, <productId2>]),
  local: new Set(),
};
```

These IDs drive the `isNew` badge shown on market cards. Each release cycle replaces the previous
batch entirely. `inkTestnet` must mirror `inkMainnet` so the badge is visible in testnet previews.

---

## Phase 4 — Add mainnet spot metadata (spot markets only)

> Skip this phase for perp-only releases.

Spot markets need entries in the **mainnet** `INK_SPOT_METADATA_BY_PRODUCT_ID` map, keyed by product
ID. Markets that were only ever listed on testnet usually have entries in the *testnet* map
(`INK_TESTNET_SPOT_METADATA_BY_PRODUCT_ID`) but **not** the mainnet one — don't assume they are
already present. If the mainnet entry is missing, the market will not render once it's unhidden.

### 4a. Add the mainnet token constants

Open:
```
packages/react-client/context/metadata/productMetadata/ink/tokens.ts
```

Each spot metadata entry references a `Token` constant. Testnet constants use the `_SEPOLIA` suffix
(e.g. `WAAPLX_INK_SEPOLIA`); mainnet constants use the bare `_INK` suffix (e.g. `WAAPLX_INK`). Under
the `Ink mainnet` section, add one constant per market using the **deployed mainnet token address**:

```ts
export const WAAPLX_INK: Token = {
  address: '0x...', // deployed Ink mainnet token address
  chainId: inkChainId,
  tokenDecimals: 18,
  // xStocks - the token is the wrapped version but we show unwrapped in UI
  symbol: 'AAPLx',
  icon: TOKEN_ICONS.aaplx,
};
```

> If the mainnet addresses aren't available yet, scaffold with `zeroAddress` (imported from `viem`)
> as a placeholder so the rest of the work can proceed — but the real addresses **must** be filled in
> before merge. Remove the `zeroAddress` import again once the addresses are in.

### 4b. Add the mainnet metadata entries

Open:
```
packages/react-client/context/metadata/productMetadata/ink/spotMetadataByProductId.ts
```

Import the new mainnet token constants and add an entry to `INK_SPOT_METADATA_BY_PRODUCT_ID` for
each product ID, mirroring the existing testnet entry but pointing at the mainnet token:

```ts
143: {
  token: WAAPLX_INK,
  marketName: `AAPLx/${PRIMARY_QUOTE_SYMBOLS.usdt0}`,
  altSearchTerms: COMMON_ALT_SEARCH_TERMS.aaplx,
  quoteProductId: QUOTE_PRODUCT_ID,
  marketCategories: new Set(['stocks']),
},
```

---

## Phase 5 — Wire up the release notification

The in-app notification tells users about newly available markets when they connect their wallet.
It requires changes to **three files**.

### 5a. Register the disclosure key

Open:
```
apps/trade/client/modules/localstorage/userState/types/userDisclosureTypes.ts
```

Add a new key to `FEATURE_NOTIFICATION_DISCLOSURE_KEYS`. The format is:
```
new_mkts_<mmm>_<dd>_<yyyy>
```
where `<mmm>` is the three-letter lowercase month abbreviation, `<dd>` is the zero-padded day, and
`<yyyy>` is the four-digit year. For example, April 14 2026 → `new_mkts_apr_14_2026`.

Replace the existing key(s) with the new one — there should only ever be one active key at a time,
since old notifications that users have already dismissed are suppressed by their stored disclosure
state:

```ts
export const FEATURE_NOTIFICATION_DISCLOSURE_KEYS = [
  'new_mkts_<mmm>_<dd>_<yyyy>',
] as const;
```

### 5b. Register which chain envs should show the notification

Open:
```
apps/trade/client/modules/notifications/emitters/FeatureNotificationsEmitter.tsx
```

Add the new key to `ENABLED_NOTIFICATION_CHAIN_ENVS`. Set the value to `undefined` to show on all
chain envs (the typical case), or pass a `ChainEnv[]` array to restrict to specific envs:

```ts
const ENABLED_NOTIFICATION_CHAIN_ENVS: Record<string, EnabledChainEnvsFilter> =
  {
    new_mkts_<mmm>_<dd>_<yyyy>: undefined,
  } satisfies Record<FeatureNotificationDisclosureKey, EnabledChainEnvsFilter>;
```

Remove the old key entry entirely.

### 5c. Add the notification handler case

Open:
```
apps/trade/client/modules/notifications/handlers/handleFeatureNotificationDispatch.tsx
```

Add a `case` for the new disclosure key. `NewMarketsFeatureNotification` is the single component for
both perp and spot markets — it resolves each product from `allMarkets` and supports multiple IDs at
once via the `productIds` array. Pass `marketType` (`ProductEngineType.PERP` or
`ProductEngineType.SPOT`) so the toast renders the right copy ("New Perp Markets" vs "New Collateral
& Spot Markets"):

```ts
case 'new_mkts_<mmm>_<dd>_<yyyy>':
  return toast.custom(
    (t) => (
      <NewMarketsFeatureNotification
        onDismiss={() => {
          toast.dismiss(t);
        }}
        ttl={Infinity}
        disclosureKey={feature}
        marketType={ProductEngineType.SPOT}
        productIds={[<productId1>, <productId2>]}
      />
    ),
    {
      duration: Infinity,
      id: feature,
    },
  );
```

> A release batch is either all-perp or all-spot, so a single `marketType` covers the case. Replace
> the old `case` block entirely.

---

## Phase 6 — Verify and commit

```bash
bun typecheck
bun lint:fix
```

Both must pass. Then commit:

```bash
git add .

git commit -m "feat: release <SYMBOL1>, <SYMBOL2> to mainnet"
```

---

## Phase 7 — Add preview commit

Vercel previews default to `nadoTestnet`, so BD can't see the released markets on the preview URL
without an extra commit that pins `dataEnv` to `nadoMainnet`. Add this as a **separate second
commit** on the same branch so it can be easily dropped before merge.

Open:
```
apps/trade/common/environment/baseClientEnv.ts
```

Hardcode `dataEnv` to `'nadoMainnet'`, ignoring the env var:

```ts
const dataEnv: DataEnv = 'nadoMainnet';
```

Commit on its own:

```bash
git add apps/trade/common/environment/baseClientEnv.ts
git commit -m "chore: hardcode dataEnv to nadoMainnet for BD preview"
```

> **Do not merge this commit.** Drop it (e.g. `git rebase -i` or revert) before merging the PR to
> `staging`. Call this out in the PR description so reviewers know to expect it.

---

## Phase 8 — Open a PR

```bash
git push -u origin release/<symbols>-mainnet
gh pr create \
  --base staging \
  --title "Release <SYMBOLS> to mainnet" \
  --body "$(cat <<'EOF'
## Summary
Releases the following markets to mainnet:

| Symbol | Type | Product ID(s) |
|---|---|---|
| SYMBOL1 | perp/spot | 123 |
| SYMBOL2 | perp/spot | 124 |

- Removed from `inkMainnet` hidden list
- Added to `inkMainnet` new list
- Notification key: `new_mkts_<mmm>_<dd>_<yyyy>`

> **Note:** Last commit (`chore: hardcode dataEnv to nadoMainnet for BD preview`) is for the Vercel
> preview only — drop it before merging to `staging`.

## Checklist
- [ ] Product IDs removed from `inkMainnet` in `hiddenProductIdsByChainEnv.ts`
- [ ] Product IDs added to `inkMainnet` in `newProductIdsByChainEnv.ts`
- [ ] (Spot only) Mainnet token constants added to `tokens.ts` with **real** addresses (no `zeroAddress` placeholders)
- [ ] (Spot only) Product IDs present in `INK_SPOT_METADATA_BY_PRODUCT_ID` in `spotMetadataByProductId.ts`
- [ ] New disclosure key added to `userDisclosureTypes.ts`
- [ ] New key registered in `FeatureNotificationsEmitter.tsx`
- [ ] Notification handler case added in `handleFeatureNotificationDispatch.tsx`
- [ ] `bun typecheck` passes
- [ ] `bun lint:fix` passes
- [ ] BD preview commit dropped before merge
EOF
)"
```

---

## Quick reference — key file paths

| Purpose | Path |
|---|---|
| Mainnet hidden list | `packages/react-client/context/metadata/consts/hiddenProductIdsByChainEnv.ts` |
| New markets list | `packages/react-client/context/metadata/consts/newProductIdsByChainEnv.ts` |
| Spot metadata (spot only) | `packages/react-client/context/metadata/productMetadata/ink/spotMetadataByProductId.ts` |
| Token constants (spot only) | `packages/react-client/context/metadata/productMetadata/ink/tokens.ts` |
| Disclosure key registry | `apps/trade/client/modules/localstorage/userState/types/userDisclosureTypes.ts` |
| Notification chain env filter | `apps/trade/client/modules/notifications/emitters/FeatureNotificationsEmitter.tsx` |
| Notification toast handler | `apps/trade/client/modules/notifications/handlers/handleFeatureNotificationDispatch.tsx` |
| Notification component | `apps/trade/client/modules/notifications/components/newFeature/features/NewMarketsFeatureNotification.tsx` |
| `dataEnv` (BD preview commit) | `apps/trade/common/environment/baseClientEnv.ts` |
