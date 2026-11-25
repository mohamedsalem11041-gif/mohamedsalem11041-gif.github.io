---
name: gsap-3d-scroll-frontend
description: Build and audit immersive front-end experiences using GSAP/ScrollTrigger, Lenis smooth scrolling, and 3D (Three.js/@react-three/fiber). Use for scroll-driven narratives, animated landings, micro-interactions, and performance/UX tuning.
---
# GSAP 3D Scroll Frontend

## Defaults
- Stack: Vite + React + TypeScript + GSAP + ScrollTrigger + Lenis; add @react-three/fiber + drei + three for 3D scenes; use vanilla GSAP for embeds or simple pages.
- Register plugins once (`gsap.registerPlugin(ScrollTrigger)`). In React, wrap animation code in `useLayoutEffect` + `gsap.context` and clean up with `ctx.revert()`.
- Prefer transforms and opacity; avoid layout-thrashing properties. Use CSS variables for spacing, colors, easing to keep motion consistent.

## Workflow
1) Align on story and motion beats: hero object, scroll chapters, micro-interactions, breakpoints, reduced-motion behavior.
2) Build static layout and tokens first; keep DOM light. Add `prefers-reduced-motion` and touch fallbacks (short timelines or disables).
3) Wire smooth scrolling (Lenis) and connect to ScrollTrigger (`scrollerProxy` + `lenis.on('scroll', ScrollTrigger.update)`).
4) Author timelines section by section using labels; minimize trigger count. Use `matchMedia` for responsive variants. Keep timelines decoupled from heavy React state.
5) QA: `ScrollTrigger.refresh()` after fonts/images load; resize/rotation tests; check performance (FPS, memory) and accessibility (focus order, readable text, motion toggle). See references.

## References
- `references/gsap-scroll-patterns.md` for ScrollTrigger/Lenis setup and common section patterns.
- `references/three-integration.md` for Three.js/@react-three/fiber patterns with GSAP.
- `references/ux-perf-checklist.md` for QA, performance, and accessibility guardrails.

## Deliverables
- Setup notes: dependencies, key commands, and where animations live.
- Timeline plan: triggers, labels, easing, mobile fallbacks.
- Code snippets ready to drop into Vite/React or vanilla, plus performance and accessibility considerations.
