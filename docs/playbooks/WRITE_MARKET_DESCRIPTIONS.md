---
name: write-market-descriptions
description: >
  Use this skill whenever writing or editing market copy in the nado-web-monorepo — the
  `marketDescription` and `fullMarketName` fields served from `/api/product-metadata` and rendered
  on market detail surfaces (web + mobile). Trigger on phrases like "write a market description",
  "update market descriptions", "add a description for <market>", or when listing a new market and
  filling in `MARKET_DESCRIPTIONS`. These rules encode reviewer feedback so AI-generated copy passes
  review the first time.
---

# Writing Market Descriptions & Names

Market copy lives in one file and is served to every surface (web + mobile) via
`/api/product-metadata`, so mistakes are user-facing everywhere at once:

| Field | File | Shown on |
|---|---|---|
| `marketDescription` | `packages/react-client/context/metadata/productMetadata/marketDescriptions.ts` | Market detail page |
| `fullMarketName` | `perpMetadata.ts` / `ink/spotMetadataByProductId.ts` | Market detail page (mobile shows this; ticker `marketName` on cards) |

## `marketDescription` rules

### Style

- **No em dashes (`—`) or en dashes (`–`).** They read as AI-generated. Use commas, periods, or
  parentheses instead.
- **Target 300–350 characters** (roughly 2–3 sentences). Long enough to be useful, short enough to
  fit the detail surface.
- **Single-quoted strings; escape apostrophes with `\'`.** The file is uniformly single-quoted —
  double quotes cause Prettier/ESLint churn and noisy diffs.

```ts
// Good
aave: 'Aave is a leading decentralized protocol for lending and borrowing crypto...',
usdt0: 'USDT0 is an omnichain deployment of Tether\'s USD₮ stablecoin...',

// Bad — em dash + double quotes
aave: "Aave is a lending protocol — one of the largest in DeFi...",
```

### Content & accuracy

- **Only state facts you can verify.** Founding years, HQ cities, leadership, and fund legal names
  have all been flagged as wrong in review. If you can't confirm a detail, leave it out rather than
  guess. (e.g. Penguin Solutions is HQ'd in Milpitas, CA — not Fremont.)
- **Use correct legal names for funds/ETFs.** "Invesco QQQ Trust" (not "Invesco QQQ ETF"),
  "SPDR S&P 500 ETF Trust" (not "SPDR SPY ETF" — `SPY` *is* the ticker, so it's redundant).
- **No circular or self-referential definitions.** Name the underlying an asset wraps or tracks so
  a reader actually learns what it is. For a wrapped/omnichain token, name and disambiguate the
  base asset with its ticker.

```ts
// Bad — defines the subject by its own name, learns nothing
xaut0: 'Tether Gold is an omnichain deployment of Tether Gold...',

// Good — names the underlying and its ticker
xaut0: 'XAUT0 is an omnichain deployment of Tether Gold (XAUT), backed by physical gold...',
```

- **Keep parallel/templated entries word-for-word consistent.** Families of similar markets
  (xStocks, wrapped tokens, forex) should differ only in the market-specific details. Don't let one
  entry say "through a broker" while its siblings say "through a traditional broker", and make
  wrapped/underlying pairs agree on the underlying's name.

## `fullMarketName` rules

- **Forex pairs must use one uniform convention across all pairs.** The current convention is the
  ticker-style slash: `EUR/USD`, `GBP/USD`, `USD/JPY`. Never mix a spelled-out currency with a code
  (`Euro/USD`, `USD/Japanese Yen`) — inconsistency across the side-by-side FX list is a repeat
  review finding.
- Otherwise `fullMarketName` is the human-readable asset name (e.g. `Bitcoin`, `Apple`), while
  `marketName` stays the ticker (`BTC`, `AAPL`). Keep names short — they can overflow on mobile.

## Before you finish

Run from the repo root:

```bash
bun typecheck
bun lint:fix
```
