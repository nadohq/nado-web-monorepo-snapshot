# Nado Web Monorepo

## Getting Started

**Dependencies**

- Install dependencies using `bun install --frozen-lockfile`.
- For usage of a _local_ Nado SDK (useful if you're testing SDK changes / unpublished SDK functionality):
    - Setup a state where the frontend code points to a local SDK build:
        - run `bun link-local` in `nado-typescript-sdk`,
        - then `bun link-local-sdk` in the root of this repo.
          > To reverse this (i.e. unlink packages for remote SDK), run `bun unlink-local-sdk` in the root of this repo.
    - Run `bun build` in the SDK repo when any code changes are made to the SDK. You will also need to build the SDK
      when setting up the integration for the first time

**Setup environment:**

For apps where a `.env` file is required, there is a `.env.local.example` file in the root of the app directory.
Copy this file to `.env.local` and fill in the necessary environment variables.

**Run**

```shell
bun run dev # Runs app at the appropriate port
```

Set `NEXT_ALLOWED_DEV_ORIGINS` env if you're accessing the dev server on a hostname other than localhost.
Example: `NEXT_ALLOWED_DEV_ORIGINS=192.168.1.15,devserver`


## Other Considerations

**[Trade App] Bundle Analyzer**

- To run the bundle analyzer, run `bun analyze` in the trade app directory. This will generate reports you can view
  at `.next/analyze/client.html` and `.next/analyze/server.html`.

**Check import issues and circular dependencies**

- To run `depcruise` on all packages, run `bun depcruise:all` in the root of the monorepo.

**Check unused or unlisted dependencies**

- Run `bun depcheck` in the root of the monorepo. Run `bun depcheck:fix` to automatically fix simple issues.
This is powered by [knip](https://knip.dev/). Run `bun knip` directly for a deeper audit, including unused files, unused exports, and more.


## Agent Instructions

LLM agent documentation lives in `AGENTS.md` at the repository root, with package/app-specific guides in their respective directories. Tool-specific files (`CLAUDE.md`, `GEMINI.md`, `.cursor/rules/`) point to `AGENTS.md`.

## Trade App End-to-end tests

This monorepo includes a dedicated app for running end-to-end tests for `apps/trade` application.

Refer to `apps/e2e/README.md` for more details.

## Internationalization (i18n)

This monorepo includes a dedicated package for locales and i18n utilities at `packages/i18n`.
Refer to `packages/i18n/README.md` for more details.
