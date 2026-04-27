# i18n

Uses `i18next`. All keys live in `locales/en/common.json`. See [GUIDELINES.md](./GUIDELINES.md) for key naming, scopes, and usage patterns.

## Commands

```bash
bun run --cwd packages/i18n i18n:extract   # Extract keys from source
bun run --cwd packages/i18n i18n:lint      # Lint translation keys
bun run --cwd packages/i18n i18n:status    # Check translation status
```

## Quick Reference

```tsx
// In React components
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// Outside React (TypeScript)
import { t } from 'i18next';

// Usage — always use typed selector
t(($) => $.yourKey)
t(($) => $.buttons.confirm)
t(($) => $.helloUser, { name: userName })       // interpolation
t(($) => $.itemCount, { count: n })             // pluralization
t(($) => $.closePosition, { context: side })    // context variants
```

You may need to include [`i18next.d.ts`](./i18next.d.ts) in your `tsconfig.json` for the typed selector to work.
