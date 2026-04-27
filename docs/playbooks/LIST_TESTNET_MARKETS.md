---
name: list-testnet-market
description: >
  Use this skill whenever listing one or more new spot or perp markets to testnet on the
  nado-web-monorepo. Trigger on phrases like "list new markets to testnet", "add perps to testnet",
  "onboard spot markets", "add testnet markets", or any mention of listing tokens/markets to the
  testnet environment. This skill covers the full workflow for batches of markets: renaming and
  committing token icons, creating market configs, hiding markets on mainnet, and opening a PR.
---

# List Testnet Markets

This skill walks through the complete process of listing one or more new spot or perp markets to
testnet in `nado-web-monorepo`. Markets are usually listed in batches — handle all of them in a
single branch and PR. Follow each phase in order.
 
---

## Prerequisites — gather before starting

Before touching any files, collect the following for **each market** being listed:

| Field | Details |
|---|---|
| Market type | spot or perp |
| Token symbol | e.g. `ETH`, `PEPE` — will be lowercased for filenames and `TOKEN_ICONS` keys |
| Token icon file | typically SVG, sometimes PNG |
| Product ID(s) | the numeric ID(s) assigned to this market |
| Token address (spot only) | the token's contract address on Ink Sepolia (testnet) |
| Token decimals (spot only) | e.g. `6` for USDC, `18` for WETH, `8` for kBTC |
| Market category | one of: `chain`, `meme`, `defi`, `commodity`, `equities`, `forex`, `indices` |
| Alt search terms | human-readable names (e.g. `['Avalanche']` for AVAX, `['Litecoin']` for LTC) |

If anything is missing for any market, stop and ask the requester before proceeding.
 
---

## Phase 1 — Branch setup

Create a dedicated branch off `staging`:

```bash
git checkout staging && git pull
git checkout -b agent/<SYMBOLS>-testnet
```

For the branch name, join the lowercased symbols with hyphens, e.g. `list/pepe-doge-testnet` or
`list/btc-usdc-spot-testnet`. If there are many markets, use a descriptive short name instead of
listing every symbol.
 
---

## Phase 2 — Token icons

Do this for every market being listed.

### 2a. Rename the icon files

Rename each provided icon to strictly lowercase symbol + original extension:

```
<LOWERCASE_SYMBOL>.<ext>
# examples:
pepe.svg
wbtc.png
doge.svg
```

For spot pairs, rename the icon for each token in the pair separately if icons were provided for
both.

### 2b. Add the icon files

Copy all renamed files into:

```
packages/react-client/context/metadata/productMetadata/tokenIcons/
```

Before adding, check this directory for existing icons to confirm the naming pattern matches what's
already there — and to avoid duplicating an icon that's already present.

### 2c. Register each icon in `tokenIcons/index.ts`

Open:
```
packages/react-client/context/metadata/productMetadata/tokenIcons/index.ts
```

For each new icon, add:
1. An import at the top of the file, sorted alphabetically with the other imports:
   ```ts
   import <symbol>Icon from './<symbol>.svg';
   ```
2. An entry in the `TOKEN_ICONS` object (also sorted alphabetically by key):
   ```ts
   <symbol>: {
     asset: <symbol>Icon,
   },
   ```

Icons are always referenced via `TOKEN_ICONS.<symbol>` — never by raw filename string. This is
where the icon becomes available to the rest of the codebase.

---

## Phase 3 — Market configuration

Handle all markets of the same type together to minimise back-and-forth on the same file.

### For perp markets

Perp markets span **three files** edited in this order:

#### 3a. `commonAltSearchTerms.ts`

Open:
```
packages/react-client/context/metadata/productMetadata/commonAltSearchTerms.ts
```

Add an entry for each new market, sorted alphabetically by key:
```ts
<symbol>: ['Full Token Name'],
```

This file maps lowercase symbol keys to arrays of human-readable search strings shown in the
market search UI. For example: `avax: ['Avalanche']`, `ltc: ['Litecoin']`.

#### 3b. `perpMetadata.ts`

Open:
```
packages/react-client/context/metadata/productMetadata/perpMetadata.ts
```

Add a named export constant for each new perp, following the existing pattern exactly:

```ts
export const <SYMBOL>_PERP_METADATA: PerpProductMetadata = {
  symbol: '<SYMBOL>',
  icon: TOKEN_ICONS.<symbol>,
  marketName: `<SYMBOL>`,
  altSearchTerms: COMMON_ALT_SEARCH_TERMS.<symbol>,
  quoteProductId: QUOTE_PRODUCT_ID,
  marketCategories: new Set(['perp', '<category>']),
};
```

`marketCategories` must always include `'perp'` plus **one** additional category from:

| Category | When to use |
|---|---|
| `chain` | L1/L2 native tokens (BTC, ETH, SOL, AVAX, LTC) |
| `meme` | Meme tokens (DOGE, PEPE, FARTCOIN) |
| `defi` | DeFi protocol tokens (AAVE, UNI, LIT) |
| `commodity` | Real-world commodities (XAUT, OIL, SILVER) |
| `equities` | Stocks (AAPL, TSLA, NVDA) |
| `forex` | Forex pairs (EURUSD, GBPUSD, USDJPY) |
| `indices` | Index products (QQQ, SPY) |

#### 3c. `perpMetadataByProductId.ts`

Open:
```
packages/react-client/context/metadata/productMetadata/perpMetadataByProductId.ts
```

1. Add an import for each new constant at the top of the file (with the other imports from `./perpMetadata`):
   ```ts
   <SYMBOL>_PERP_METADATA,
   ```
2. Add the product ID → metadata mapping in `PERP_METADATA_BY_PRODUCT_ID`, sorted by numeric ID:
   ```ts
   <productId>: <SYMBOL>_PERP_METADATA,
   ```

Note: `PERP_METADATA_BY_PRODUCT_ID` is shared across **all** chain environments (mainnet, testnet,
local) — the hidden list in Phase 4 is what controls per-env visibility.

### For spot markets

Spot markets live in two files under `packages/react-client/context/metadata/productMetadata/ink/`.

#### 3a. `ink/tokens.ts`

Open:
```
packages/react-client/context/metadata/productMetadata/ink/tokens.ts
```

Add a token constant in the **Ink Sepolia** section (for testnet). The mainnet section only needs
an entry if the token is also being listed on mainnet, which is not the case here.

```ts
export const <SYMBOL>_INK_SEPOLIA: Token = {
  address: '<INK_SEPOLIA_CONTRACT_ADDRESS>',
  chainId: inkSepoliaChainId,
  tokenDecimals: <decimals>,
  symbol: '<SYMBOL>',
  icon: TOKEN_ICONS.<symbol>,
};
```

Use `inkSepoliaChainId` (already declared at the top of the file) for the testnet chain ID.

#### 3b. `ink/spotMetadataByProductId.ts`

Open:
```
packages/react-client/context/metadata/productMetadata/ink/spotMetadataByProductId.ts
```

1. Import the new token constant at the top of the file.
2. Add an entry to `INK_TESTNET_SPOT_METADATA_BY_PRODUCT_ID`:

```ts
<productId>: {
  token: <SYMBOL>_INK_SEPOLIA,
  marketName: `<SYMBOL>/${PRIMARY_QUOTE_SYMBOLS.usdt0}`,
  altSearchTerms: COMMON_ALT_SEARCH_TERMS.<symbol>,
  quoteProductId: QUOTE_PRODUCT_ID,
  marketCategories: new Set(['spot', '<category>']),
},
```

You also need to add the alt search terms entry to `commonAltSearchTerms.ts` (same as for perps
above) before referencing it here.

Do **not** add to `INK_SPOT_METADATA_BY_PRODUCT_ID` (the mainnet section) — the market is
testnet-only.

---

## Phase 4 — Hide on mainnet

Open:
```
packages/react-client/context/metadata/consts/hiddenProductIdsByChainEnv.ts
```

Add **all new product IDs** to the `inkMainnet` set (the key name is `inkMainnet`, not `mainnet`).
Follow the existing convention of adding a comment above each ID with the market symbol:

```ts
inkMainnet: new Set([
  ...DELISTED_PRODUCT_IDS,
  NLP_PRODUCT_ID,
  // USELESS
  42,
  // <SYMBOL>         ← add your comment + ID here
  <productId>,
]),
```

Do **not** modify the `inkTestnet` or `local` sets — new markets should be visible on testnet.

---

## Phase 5 — Verify and commit

Run the standard checks from the repo root:

```bash
bun typecheck
bun lint:fix
```

Both must pass. Then review your staged changes and commit:

```bash
git add .

git commit -m "feat: list <SYMBOL1>, <SYMBOL2>, ... <spot|perp> markets to testnet"
```

---

## Phase 6 — Open a PR

Push the branch and open a PR **targeting `staging`**:

```bash
git push -u origin list/<symbols>-testnet
gh pr create \
  --base staging \
  --title "List <SYMBOLS> to testnet" \
  --body "$(cat <<'EOF'
## Summary
Lists the following markets to testnet:
 
| Symbol | Type | Product ID(s) |
|---|---|---|
| SYMBOL1 | perp/spot | 123 |
| SYMBOL2 | perp/spot | 124, 125 |
 
- Token icons added to `tokenIcons/` and registered in `tokenIcons/index.ts`
- Alt search terms added to `commonAltSearchTerms.ts`
- All product IDs hidden on mainnet via `hiddenProductIdsByChainEnv.ts`
 
## Checklist
- [ ] Icons renamed, placed in `tokenIcons/`, and registered in `tokenIcons/index.ts`
- [ ] Alt search terms added to `commonAltSearchTerms.ts`
- [ ] Market configs added (perp: `perpMetadata.ts` + `perpMetadataByProductId.ts`; spot: `tokens.ts` + `spotMetadataByProductId.ts`)
- [ ] All product IDs added to `inkMainnet` hidden list
- [ ] `bun typecheck` passes
- [ ] `bun lint:fix` passes
EOF
)"
```
 
---

## Quick reference — key file paths

| Purpose | Path |
|---|---|
| Token icon SVG/PNG files | `packages/react-client/context/metadata/productMetadata/tokenIcons/` |
| Token icon registry (imports + TOKEN_ICONS object) | `packages/react-client/context/metadata/productMetadata/tokenIcons/index.ts` |
| Alt search terms | `packages/react-client/context/metadata/productMetadata/commonAltSearchTerms.ts` |
| Perp metadata constants | `packages/react-client/context/metadata/productMetadata/perpMetadata.ts` |
| Perp product ID → metadata map | `packages/react-client/context/metadata/productMetadata/perpMetadataByProductId.ts` |
| Spot token addresses | `packages/react-client/context/metadata/productMetadata/ink/tokens.ts` |
| Spot product ID → metadata map | `packages/react-client/context/metadata/productMetadata/ink/spotMetadataByProductId.ts` |
| Mainnet hidden list | `packages/react-client/context/metadata/consts/hiddenProductIdsByChainEnv.ts` |
