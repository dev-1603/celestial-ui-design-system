---
'@celestial-ui/tokens': patch
'@celestial-ui/theme': patch
'@celestial-ui/styles': patch
'@celestial-ui/icons': patch
'@celestial-ui/core': patch
---

Make Node-native ESM imports work by rewriting relative specifiers in dist/esm (JS and declarations). Theme now declares sideEffects: false. Local independent-repo consumption is documented and tested via pnpm link: (Yarn Berry portal:).
