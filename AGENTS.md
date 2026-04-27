# Nado Web Monorepo

DeFi trading platform — perpetuals, spot trading, vault-based liquidity protocol.

## Documentation

Read the doc that matches your task:

| Task | Read |
|------|------|
| Adding a query or execute hook in the trade app | [apps/trade/AGENTS.md](apps/trade/AGENTS.md) |
| Writing E2E tests | [apps/e2e/AGENTS.md](apps/e2e/AGENTS.md) |
| Adding or modifying a UI component | [packages/web-ui/AGENTS.md](packages/web-ui/AGENTS.md) |
| Formatting numbers, prices, or sizes | [packages/react-client/AGENTS.md](packages/react-client/AGENTS.md) |
| Adding user-facing strings | [packages/i18n/GUIDELINES.md](packages/i18n/GUIDELINES.md) |
| Style, component, or naming conventions | [docs/STYLEGUIDE.md](docs/STYLEGUIDE.md) |
| Architectural decisions | [docs/TECHNICAL_DECISIONS.md](docs/TECHNICAL_DECISIONS.md) |

## Playbooks

Playbooks for common tasks. These are written as skills but located in the repo:
- [Adding new markets to testnet](docs/playbooks/LIST_TESTNET_MARKETS.md)
- [Releasing hidden mainnet markets](docs/playbooks/UNLOCK_MAINNET_MARKETS.md)


## Verification

After making edits, **always** run:

```bash
bun typecheck
bun lint:fix
```

Both must pass before work is considered complete.

**There are no unit tests.** Do NOT run `bun test` or similar — they do not exist.

## Core Principles

- **Follow existing patterns.** Find a similar example in the codebase and match its structure.
- **Minimal impact.** Touch only what is necessary.
- **Type safety.** No `any` types. Use Zod schemas with `z.infer`, narrow with runtime checks.
- **Don't over-document.** Don't add JSDoc/comments to code you didn't write or change. Follow `docs/STYLEGUIDE.md` for new code.

## Critical Rules

### Do NOT Touch

- `apps/trade/public/charting_library/` — vendored TradingView
- `*.generated.*` files — auto-generated
- Lock files (`bun.lock`) — only via `bun install`

### Security

- Never commit `.env.local`, private keys, or API secrets
- Never log wallet private keys or signer data

### Comments

- When refactoring or moving code, preserve existing comments — don't silently drop them
- If code is restructured such that a comment no longer applies in its original form, adapt the comment to the new context rather than removing it

For component conventions, className rules, and naming, see `docs/STYLEGUIDE.md`.

### State Management Rules

- **Jotai atoms** for global client state (UI preferences, navigation)
- **TanStack Query** for all server/API/blockchain data
- **React Context** for scoped services (form instances, API clients, feature contexts)
- **useState** only for truly local, single-component state
- Never mix patterns — don't put server data in Jotai atoms

### Query & Mutation Rules

- Always wrap `useQuery`/`useMutation` in custom hooks — never directly in components
- Name query hooks `useQuery<Name>`, execute hooks `useExecute<Name>`, derived hooks descriptively (e.g., `useFundingChart`)
- Name loading variables `is<DataName>Loading` matching the data variable — e.g., `data: allMarketData` → `isLoading: isAllMarketDataLoading`
- Use `createQueryKey()` for standardized query keys
- Use `QueryDisabledError` for conditionally disabled queries
- Use `useExecuteInValidContext()` wrapper for mutations needing wallet/client context
- Use `logExecuteError()` for consistent error logging in mutations

### Number Handling

- Use `BigNumber` from `bignumber.js` for all financial calculations — create via `toBigNumber()`, never `new BigNumber()`
- Never use native JS numbers for prices, amounts, or sizes
- Use `formatNumber()` with `PresetNumberFormatSpecifier` or `CustomNumberFormatSpecifier` for display
- `formatNumber()` accepts `null | undefined` — returns `'--'` for nullish values. Do NOT add null checks before calling it.
- Use `safeDiv()` to prevent division-by-zero errors

### i18n Rules

- Never hard-code user-facing strings — use translation keys
- See `packages/i18n/GUIDELINES.md` for patterns and key naming conventions
