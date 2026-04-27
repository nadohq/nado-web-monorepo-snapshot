# Technical Decisions

This document describes the architectural choices and technical considerations for the nado-web-monorepo project.

## Decisions

### Treating USDT as 1:1 with USD / $

We treat USDT as equivalent to USD at a 1:1 ratio to simplify the codebase and avoid currency conversion overhead.
Fields are suffixed with `Usd` to indicate they should be displayed with dollar formatting (i.e. $xxx.yy).
