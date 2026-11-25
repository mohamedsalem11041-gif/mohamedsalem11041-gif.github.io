# UX + Performance Checklist

- Motion control: respect `prefers-reduced-motion`; offer a toggle; on touch devices shorten or disable long scrub timelines; keep CTAs reachable without scroll-locked pins.
- ScrollTrigger hygiene: fewer triggers, more labels; set `once: true` where possible; avoid animating layout properties; keep pinned sections under 300vh unless justified.
- Responsiveness: use `matchMedia` to swap to simple fades on small screens; avoid text split effects on narrow widths; ensure text stays readable at 1.1-1.2 line-height.
- Performance: limit simultaneous 3D + DOM animations; throttle expensive callbacks; debounce `ScrollTrigger.refresh()` when resizing; pre-load heavy assets before enabling timelines.
- Accessibility: preserve focus order during pins; keep interactive elements keyboard reachable; avoid auto-playing audio/video without controls; ensure color contrast meets WCAG AA.
- QA: check FPS and memory in DevTools performance; verify `ScrollTrigger.getAll().length` is expected; test in Safari/iOS; confirm timelines resume after modal open/close (pause Lenis when needed).
