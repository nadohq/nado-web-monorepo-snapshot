# web-ui

Shared React UI component library (`@nadohq/web-ui`). Always use existing components before creating new ones — browse `components/`.

## Interactive State Styling

Use `getStateOverlayClassNames` instead of raw Tailwind `hover:` / `active:` / `disabled:` classes. It renders a consistent pseudo-element overlay.

## Compound Components

Complex components (Select, RadioGroup) use the namespace pattern — import the namespace, use dot notation for subcomponents:

```tsx
import { Select } from '@nadohq/web-ui';

<Select.Root value={value} onValueChange={setValue}>
  <Select.Trigger>Choose one</Select.Trigger>
  <Select.Options>
    <Select.Option value="a">Option A</Select.Option>
  </Select.Options>
</Select.Root>
```

## Time Formatting

Use `formatTimestamp` / `formatDurationMillis` with `TimeFormatSpecifier` presets — don't use date-fns directly for formatting.
