# Trade App

This file extends the root AGENTS.md with trade-app-specific patterns.

## Module Structure

Modules in `client/modules/` are self-contained feature areas. Each module owns its components, hooks, types, and utils.

Create a new module when the feature is a **distinct, self-contained domain** with its own UI, hooks, and/or state. Don't create a module for small utilities or shared helpers — those belong in `client/utils/` or `client/hooks/`.

When adding a new module:

1. Create directory under `client/modules/<moduleName>/`
2. Follow existing module structure (components, hooks, types, utils as needed)
3. Keep the module self-contained — limit cross-module imports to public-facing exports only
4. Do not create barrel `index.ts` files — index files are only used in packages, not in app modules

Browse `client/modules/` for existing modules.

## State Management

See root `AGENTS.md` for state management patterns and rules.

### Persistent Atoms

Use `useStorageAtom` (not raw `localStorage`) for atoms that survive page refresh — it handles SSR safety:

```tsx
import { createLocalStorageAtom, useStorageAtom } from '@nadohq/web-common';

export const userSettingsAtom = createLocalStorageAtom('nado', 'settings', defaults);
const [settings, setSettings, didLoad] = useStorageAtom(userSettingsAtom, defaults);
```

Note: new persistent state should use `SavedUserState` / `useSavedUserState` from `client/modules/localstorage/userState/` — `createLocalStorageAtom` is being phased out.

Atoms are organized by domain in `client/store/`.

### Execute Pattern Rules

- Always invalidate/update related queries in `onSuccess`
- Never call SDK methods directly in components — always through execute hooks

## Rules

- Keep modules self-contained — limit cross-module imports to public-facing exports only
- Query hooks go in `client/hooks/query/`, execute hooks in `client/hooks/execute/`
- Query/execute hooks specific to a self-contained module go in the associated module folder, not in the global `client/hooks/` directories
- Store files go in `client/store/` organized by domain
- Page components in `client/pages/` are imported by thin wrappers in `app/`
- Never import directly from `public/charting_library/` — use the chart module's abstractions
