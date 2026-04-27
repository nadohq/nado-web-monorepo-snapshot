# Code Style Guide

For architectural patterns (state management, query/mutation rules, number handling), see root `AGENTS.md`.

## ClassName Rules

- Use `joinClassNames()` to combine classes — no conflict resolution, better performance
- Use `mergeClassNames()` only when consumers need to override default Tailwind classes (e.g., at a component root that accepts an external `className` prop)
- Never use template literals for className concatenation

## Component Rules

- Never use `React.FC` — use plain function declarations
- Use `const` arrow functions for declarations inside components and hooks — not `function`
- Extend helper types in interfaces — don't wrap: `interface Props extends WithClassnames`, not `WithClassnames<Props>`
- Extract props to `interface Props` when component has 3+ props; inline type for fewer
- Use `T | undefined` for props that must be passed but may be undefined (e.g., loading data); use `?:` only for truly optional overrides
- Use compound component pattern (namespace) for complex components (see `Select.Root`, `Input.Container`)

## Documentation Standards

- **Document for Clarity** - Explain the reasoning behind the code when it is not obvious
- **Be Concise** - Keep descriptions clear and to the point
- **Be Specific** - Explain what the function/variable does and why it is needed
- **Avoid Redundancy** - Don't repeat information already clear from the code
- **Include Edge Cases** - Document important limitations or special behaviors

## TypeScript

### `T | undefined` vs `?:` for Optional Properties

Use `T | undefined` when the prop **must always be passed** but its value may be undefined (e.g., data that hasn't
loaded yet). TypeScript will error if the consumer omits the prop.

Use `?:` when the prop is a **truly optional override** that doesn't need to be set every time.

```typescript
interface Props {
  price: BigNumber | undefined;  // Must pass — may be undefined while loading
  formatSpecifier?: string;        // Optional override — can omit entirely
}
```

### Interface vs. Type

Use `interface` over `type` where possible:

```typescript
// Good
interface Props extends WithClassnames { ... }

// Bad
type Props = { ... } & WithClassnames
```

### Props/Params Interface Extraction

Extract props/params to a named `interface Props/Params` when a component has **3+ parameters**. Inline the type for fewer:

```typescript
// 1-2 props: inline
function Badge({ label }: { label: string }) { ... }

// 3+ props: extract
interface Props {
  price: BigNumber | undefined;
  side: OrderSide;
  size?: 'sm' | 'md';
}
function PriceDisplay({ price, side, size }: Props) { ... }
```

### Helper Type Extension

Extend helper types in interfaces — don't wrap:

```typescript
// Good
interface Props extends WithClassnames { ... }

// Bad
function Component(props: WithClassnames<Props>) { ... }
```

## Function Declarations

Use `const` arrow functions inside components and hooks, not `function` declarations:

```typescript
// Good
useEffect(() => {
  const someAction = () => { ... };
}, []);

// Bad
useEffect(() => {
  function someAction() { ... }
}, []);
```

Use `function` declarations for top-level functions:

```typescript
function topLevelFunction() { ... }
```

## UI Terminology

- **`title`** — Categorizes the contents of a component (e.g., card heading "Totals"). No direct correlation to specific
  data.
- **`label`** — Accompanies a specific data element or input (e.g., "Total: $100"). Direct correlation with the data
  displayed.

Exception: `<input>` elements use `label` per HTML convention.

## Asset Handling

Import images directly instead of string paths (enables Next.js automatic `width`/`height` inference):

```tsx
import profilePic from '../public/me.png';

<Image src={profilePic}/>   // Good — auto width/height
<Image src="/me.png"/>       // Bad — requires manual width/height
```

Place assets at the **lowest common level**:

- Module-specific → `modules/<moduleName>/assets/`
- Shared across app → root `assets/`

## Conditional Logic

- **Limit ternary / single-line expressions to one level** for readability
- **Use IIFE** with early returns for complex conditional assignments

```typescript
const status = isActive ? 'active' : 'inactive';

const result = (() => {
  if (isDisabled) return 'disabled';
  if (isLoading) return 'loading';
  return 'enabled';
})();
```

Never nest ternaries / single-line expressions:

```typescript
// BAD - use an IIFE instead
const result = isActive ? (isLoading ? 'loading' : 'active') : 'inactive';
```

## Naming Conventions

- **Variables and functions**: `camelCase`
- **Static Constants (outside scope of functions, classes, etc.)**: `CAPITAL_SNAKE_CASE`
- **Booleans**: Prefix with `is`, `has`, or `should` — e.g. `isLoading`, `hasDataLoaded`, `shouldShowModal`
- **Files**: `camelCase.ts`, `PascalCase.tsx` for components
- **Directories**: `camelCase` or `PascalCase`
- **Types/Interfaces**: `PascalCase`
- **Image files**: `kebab-case.png`
