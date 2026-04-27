# E2E Testing Contribution Guide

This guide outlines the approach and patterns for adding new end-to-end (E2E) tests to the `apps/e2e` package.

## Architecture & Patterns

We use **Playwright** with a custom **Web3 Fixture** to handle wallet interactions and blockchain state.

### Page Object Model (POM)
We strictly follow the Page Object Model pattern to keep tests maintainable and readable.

- **Components (`src/components/`)**: Small, reusable UI units (e.g., `MarketOrderTab`, `Navbar`, `PositionRow`).
- **Pages (`src/pages/`)**: High-level page objects that compose multiple components (e.g., `TradePage`).
- **Locators**: Use `getByTestId()` whenever possible. Avoid using CSS selectors or XPath unless absolutely necessary.

### Web3 Fixture
Our custom fixture (`src/fixtures/web3Fixture.ts`) provides:
- `walletClient`: A viem wallet client for signing transactions.
- `page`: A Playwright page with a mocked `window.ethereum` provider.
- `context`: Browser context with optional auth state restoration.

### Test Data & Types
All shared types, enums, and assertion interfaces are defined in `src/types.ts`. Use these to ensure type safety across tests and components.

---

## How to Add a New Test

### 1. Identify the Feature
Decide where your test belongs:
- `src/tests/market/`: For trading-related tests that might need to run **serially** (due to position/order conflicts).
- `src/tests/general/`: For independent tests that can run in **parallel** (e.g., login, UI-only checks).

### 2. Use or Create Components
Check `src/components/` to see if the UI elements you need are already modeled. If not:
1. Create a new component class.
2. Initialize locators in the `constructor` using `this.page.getByTestId()`.
3. Add descriptive methods for interactions (e.g., `fillForm()`, `clickSubmit()`).
4. Add the component to the relevant page object (e.g., `TradePage.ts`).

### 3. Write the Test Spec
Follow the existing structure:

```typescript
import { expect, test } from 'src/fixtures/web3Fixture';
import { TradePage } from 'src/pages/TradePage';

test.describe('My Feature', () => {
  let tradePage: TradePage;

  test.beforeEach(async ({ page }) => {
    tradePage = new TradePage(page);
    await tradePage.goto();
    
    // Optional: Ensure clean state
    await tradePage.positions.closeAllPositions();
  });

  test('should perform an action @smoke', async ({ page }) => {
    // 1. Interact
    await tradePage.marketOrderForm.fillForm({ ... });
    await tradePage.marketOrderForm.clickSubmitOrder();

    // 2. Assert
    const [position] = await tradePage.positions.getPositions();
    expect(position).toMatchObject({ ... });
  });
});
```

### 4. Data-Driven Testing
For repetitive scenarios (e.g., Buy vs Sell, Cross vs Isolated), use data-driven patterns:

```typescript
const TEST_CASES = [ ... ];

for (const testCase of TEST_CASES) {
  test(`should work for ${testCase.name}`, async ({ page }) => {
    // ...
  });
}
```

---

## Best Practices

- **Clean Up**: Always try to leave the account in a clean state (close positions, cancel orders) in `beforeEach` or `afterEach`.
- **Soft Assertions**: Use `expect.soft()` for non-critical checks that shouldn't stop the entire test.
- **Wait for API**: Use `tradePage.waitForAPIResponse(key)` to ensure the backend has processed your request before asserting on UI changes.
- **Tags**: Use `@smoke` for critical path tests.
- **Import Style**: Always use absolute imports rooted at `src/` (e.g. `import { TradePage } from 'src/pages/TradePage';`).

## Running Tests

```bash
# Run all tests
bun run test:e2e

# Run in headed mode
bun run test:e2e:headed

# Open Playwright UI
bun run test:e2e:ui

# Run test with debug mode
bun run test:e2e --debug
```
