# E2E Tests

This file extends the root AGENTS.md with end-to-end-specific patterns.

End-to-end tests for the Trade application using Playwright with a custom Web3 fixture.

For setup and running, see **[README.md](./README.md)**.
For contribution patterns, see **[CONTRIBUTING.md](./CONTRIBUTING.md)**.

## Architecture

```
apps/e2e/src/
├── tests/                  # Test specs
│   ├── general/            # Independent tests (login, UI-only)
│   └── market/             # Trading tests (run serially)
├── pages/                  # Page Object Models
├── components/             # POM component classes
├── fixtures/               # Playwright fixtures (Web3 wallet mock)
├── types/                  # Shared types and enums
├── scripts/                # Wallet funding, key management
└── utils/                  # Client factories, formatting
```

## Test Pattern

Tests interact with the UI through page objects, never directly with locators:

```typescript
import { expect, test } from 'src/fixtures/web3Fixture';
import { TradePage } from 'src/pages/TradePage';

test.describe('Feature', () => {
  let tradePage: TradePage;

  test.beforeEach(async ({ page }) => {
    tradePage = new TradePage(page);
    await tradePage.goto();
    await tradePage.positions.closeAllPositions();
  });

  test('should place a market order @smoke', async () => {
    await tradePage.orderForm.configure({ side: 'long', marginMode: 'cross', leverage: '5' });
    await tradePage.orderForm.baseInputs.sizeInput.fill('10');
    await tradePage.orderForm.orderSettings.clickSubmitOrder();

    const [position] = await tradePage.positions.getPositions();
    expect(position).toMatchObject({ side: 'Long' });
  });
});
```

## Test Organization

| Directory | When to use | Execution |
|-----------|-------------|-----------|
| `tests/general/` | Independent tests (login, UI, settings) | Can run in parallel |
| `tests/market/` | Trading tests that modify position/order state | Run serially |

## Rules

- **Imports:** Always import `test` and `expect` from `src/fixtures/web3Fixture` — never from `@playwright/test` (bypasses the Web3 wallet mock).
- **Interactions:** All interactions must go through POM components — never call `page.locator()`, `page.click()`, or `page.fill()` directly in spec files.
- **Locators:** Always use `getByTestId()` — avoid CSS selectors or XPath. If a `data-testid` is missing, add it to the trade app source.
- **Absolute imports:** Always use absolute imports rooted at `src/`.
- **State cleanup:** Always clean up state in `beforeEach` (close positions, cancel orders).
- **Parallelism:** Never use `test.describe.parallel` in `tests/market/` — tests there modify shared blockchain state and must run serially.
- **Smoke tests:** Tag critical path tests with `@smoke`.
- **Soft assertions:** Use `expect.soft()` for non-critical assertions.
- **Flakiness:** First check for missing explicit waits (`waitForSelector`) — Web3 indexers and block times are variable.
