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

Add all new product IDs to the `inkMainnet` set. Only `inkMainnet` should be populated — leave
`inkTestnet` and `local` as empty sets.

```ts
export const NEW_PRODUCT_IDS_BY_CHAIN_ENV: Record<ChainEnv, Set<number>> = {
  inkMainnet: new Set([...existing IDs..., <productId1>, <productId2>]),
  inkTestnet: new Set([...existing IDs...]),
  local: new Set(),
};
```

These IDs drive the `isNew` badge shown on market cards. They stay here until the next market
release cycle, when they get replaced by the newer batch.

---

## Phase 4 — Wire up the release notification

The in-app notification tells users about newly available markets when they connect their wallet.
It requires changes to **three files**.

### 4a. Register the disclosure key

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

### 4b. Register which chain envs should show the notification

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

### 4c. Add the notification handler case

Open:
```
apps/trade/client/modules/notifications/handlers/handleFeatureNotificationDispatch.tsx
```

Add a `case` for the new disclosure key. Choose the component based on market type:

**For perp markets** (supports multiple at once via `productIds` array):
```ts
case 'new_mkts_<mmm>_<dd>_<yyyy>':
  return toast.custom(
    (t) => (
      <PerpMarketsFeatureNotification
        onDismiss={() => {
          toast.dismiss(t);
        }}
        ttl={Infinity}
        disclosureKey={feature}
        productIds={[<productId1>, <productId2>]}
      />
    ),
    {
      duration: Infinity,
      id: feature,
    },
  );
```

**For a single spot market** (takes a single `productId`):
```ts
case 'new_mkts_<mmm>_<dd>_<yyyy>':
  return toast.custom(
    (t) => (
      <SpotMarketFeatureNotification
        onDismiss={() => {
          toast.dismiss(t);
        }}
        ttl={Infinity}
        disclosureKey={feature}
        productId={<productId>}
      />
    ),
    {
      duration: Infinity,
      id: feature,
    },
  );
```

Replace the old `case` block entirely.

---

## Phase 5 — Verify and commit

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

## Phase 6 — Open a PR

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

## Checklist
- [ ] Product IDs removed from `inkMainnet` in `hiddenProductIdsByChainEnv.ts`
- [ ] Product IDs added to `inkMainnet` in `newProductIdsByChainEnv.ts`
- [ ] New disclosure key added to `userDisclosureTypes.ts`
- [ ] New key registered in `FeatureNotificationsEmitter.tsx`
- [ ] Notification handler case added in `handleFeatureNotificationDispatch.tsx`
- [ ] `bun typecheck` passes
- [ ] `bun lint:fix` passes
EOF
)"
```

---

## Quick reference — key file paths

| Purpose | Path |
|---|---|
| Mainnet hidden list | `packages/react-client/context/metadata/consts/hiddenProductIdsByChainEnv.ts` |
| New markets list | `packages/react-client/context/metadata/consts/newProductIdsByChainEnv.ts` |
| Disclosure key registry | `apps/trade/client/modules/localstorage/userState/types/userDisclosureTypes.ts` |
| Notification chain env filter | `apps/trade/client/modules/notifications/emitters/FeatureNotificationsEmitter.tsx` |
| Notification toast handler | `apps/trade/client/modules/notifications/handlers/handleFeatureNotificationDispatch.tsx` |
