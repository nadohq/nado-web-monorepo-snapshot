# Nado Web - Packages

Collection of packages that the monorepo apps rely on.

## Packages

### `eslint-config-custom`

Centralized configuration for ESLint. The naming postfix of `-custom` allow us to do the following:

`extends: ['custom']` in `eslintrc.js` of consumer apps (no idea how this works!)

### `ts-config`

Different `tsconfig.json` files for different use cases.

### `common`

A collection of common utils.

### i18n

Shared package for internationalization, including locales, utilities, and configurations.

### `metadata`

A collection of metadata shared between monorepo apps.

### `data`

Shared context & hooks for interacting with the Nado SDK. This package assumes that contexts are children of
a `QueryClientProvider` from `react-query`.

### `ui`

Shared package for default Tailwind config and common components.

## Development Notes

**Imports**

Imports within packages should be _relative_. If we declare `"baseUrl": "."` in `tsconfig.json` and use absolute
imports,
consumer apps will actually fail to resolve these imports because the apps themselves use `"baseUrl": "."`.

[This](https://github.com/vercel/turbo/discussions/620) is a potential solution, but relative imports generally work out
a bit better.
