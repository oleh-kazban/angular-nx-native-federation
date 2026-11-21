# demo-contracts

Framework-free contracts shared by the shell and the remotes, imported as `@client-portal/shared/demo-contracts`.

It currently exports `DEMO_BRAND`, the product name shown by the remote pages.

## How it is shared

Every `federation.config.mjs` lists the library in `sharedMappings`, so the shell and the remotes load one singleton instance at runtime instead of bundling their own copies.

## Tests

The library holds only constants and types, so it has no specs; `nx test demo-contracts` passes with no tests (`passWithNoTests`).
