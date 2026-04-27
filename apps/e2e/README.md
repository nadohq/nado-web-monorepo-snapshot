# Trade App E2E Tests

This directory contains End-to-End tests for the Trade application, built with [Playwright](https://playwright.dev/).

## Prerequisites

- [Bun](https://bun.sh/)
- A test wallet with:
  - NADO deposit (for trading) (You can obtain funds using [Faucet](https://testnet.nado.xyz/portfolio/faucet))

## Setup Guide

1. **Install dependencies:**

```bash
bun install --frozen-lockfile
```

2. **Install Playwright browsers:**

   We explicitly use **Desktop Chrome** only.

```bash
bunx playwright install --with-deps chromium
```

3. **Configure Environment:**

   Copy the example environment file to `.env.local`:

```bash
cp .env.local.example .env.local
```

   Open `.env.local` and fill in the required variables:
   - `PRIVATE_KEY`: Your test wallet private key (starts with `0x...`)
   - `BASE_URL`: (Optional) Defaults to `http://localhost:3002` if not set.

## Running Tests

We have two main test suites. Both automatically run the authentication setup before executing tests.

### 1. Smoke Tests (Critical Path)

Runs only tests tagged with `@smoke`. Use this for quick verification.

```bash
bun run test:e2e:smoke
```

### 2. All Tests

Runs the entire test suite.

```bash
bun run test:e2e:all
```

### Debugging & Development

- **UI Mode** (Recommended for writing/debugging tests):
  
```bash
bun run test:e2e:ui
```

- **Headed Mode** (Watch execution in browser):
  
```bash
bun run test:e2e:headed
```

## Project Structure

- `src/tests`: Test files
- `src/pages`: Page Object Models
- `src/fixtures`: Test fixtures (wallet, auth setup)
- `playwright.config.ts`: Main configuration (setup dependencies, timeouts, etc.)
