# react-client

Shared hooks, contexts, and utilities for blockchain data and number formatting. All exports available from `@nadohq/react-client`.

## Number Formatting

```ts
import { formatNumber, PresetNumberFormatSpecifier, CustomNumberFormatSpecifier } from '@nadohq/react-client';

// formatNumber accepts null/undefined — returns '--'. Never add a null check before calling.
formatNumber(price, { formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP });
formatNumber(size, { formatSpecifier: CustomNumberFormatSpecifier.NUMBER_AUTO });
```

Two specifier families — read the enums for the full list:
- `PresetNumberFormatSpecifier` — fixed-precision (currency, number, percentage, signed variants)
- `CustomNumberFormatSpecifier` — context-aware (auto-precision, abbreviated, zero-safe signed)

For market-specific data, prefer `getMarketPriceFormatSpecifier` / `getMarketSizeFormatSpecifier` / `getMarketQuoteSizeFormatSpecifier` over hardcoded specifiers.

## BigNumber

```ts
import { toBigNumber } from '@nadohq/client'; // NOT from react-client
import { safeDiv } from '@nadohq/react-client';

const bn = toBigNumber(rawValue);               // Always use toBigNumber(), never new BigNumber()
const result = safeDiv(numerator, denominator); // Returns 0 / BigNumbers.ZERO on zero denominator
```

`safeDiv` accepts `number | BigNumber`; return type matches input type.

## Query Utilities

```ts
import { createQueryKey, QueryDisabledError } from '@nadohq/react-client';

// createQueryKey terminates early on undefined — enables wildcard invalidation by prefix
const queryKey = createQueryKey('marketSnapshots', chainEnv, productId);

// Throw QueryDisabledError in queryFn when prerequisites aren't met
queryFn: () => {
  if (!address) throw new QueryDisabledError();
  return fetchData(address);
},
```

## Contexts

In the trade app, use `useExecuteInValidContext` (`client/hooks/execute/util/`) rather than consuming blockchain contexts directly — it validates wallet, client, and subaccount before executing.
