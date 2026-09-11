---
'@celestial-ui/tokens': minor
'@celestial-ui/theme': minor
'@celestial-ui/styles': minor
---

Add opt-in JS subpath exports so consumers can import catalog, resolve, theme identity, and styles runtime/SSR/compiler without the CJS root barrels. Root imports are unchanged. Tokens/styles tarballs no longer include build scripts.
