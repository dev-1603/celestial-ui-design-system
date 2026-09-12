---
'@celestial-ui/tokens': minor
'@celestial-ui/theme': minor
'@celestial-ui/styles': minor
'@celestial-ui/icons': minor
'@celestial-ui/core': minor
---

Ship dual CJS and ESM builds via two tsc emits. Existing subpaths and CJS `main`/`types` stay; `import` conditions resolve ESM for bundlers while `default`/`require` keep Node CJS.
