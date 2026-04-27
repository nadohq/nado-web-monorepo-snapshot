# web-common

Shared utility functions and types. All exports available from `@nadohq/web-common`.

## className Utilities

Default to `joinClassNames` — it's faster and doesn't resolve Tailwind conflicts. Only use `mergeClassNames` at a component root that accepts an external `className` prop (where consumers need to override defaults).

```ts
import { joinClassNames, mergeClassNames } from '@nadohq/web-common';

joinClassNames('text-sm', isActive && 'text-primary', className) // default
mergeClassNames('p-4 text-sm', className)                        // only for consumer overrides
```

## Utility Types

Extend these in interfaces — don't wrap:

```ts
import { WithClassnames, WithChildren } from '@nadohq/web-common';

interface Props extends WithClassnames, WithChildren {
  value: string;
}
```
