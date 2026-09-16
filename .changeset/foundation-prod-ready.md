---
'@celestial-ui/tokens': patch
'@celestial-ui/theme': patch
'@celestial-ui/styles': patch
'@celestial-ui/icons': patch
'@celestial-ui/core': patch
---

Keep unused tokens/theme root imports browser-safe by embedding the token catalog at build time. Ship catalogue-sized Lucide and Heroicons adapters without Node fs. Stop re-exporting styles @internal helpers from the package root.
