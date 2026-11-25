# GSAP + ScrollTrigger Patterns

## Smooth scroll + ScrollTrigger (React)
Use once near the app shell. Clean-up kills triggers to avoid stale proxies; re-run after route changes.

```ts
import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

export function useGsapSmooth() {
  useLayoutEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, smoothTouch: false });
    let rafId = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    });

    lenis.on('scroll', ScrollTrigger.update);

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll?.instance?.scroll || window.scrollY;
      },
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }),
      pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
    });

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      ScrollTrigger.clearMatchMedia();
      ScrollTrigger.killAll();
    };
  }, []);
}
```

## MatchMedia shell (React)
Use `gsap.context` so selectors stay scoped.

```ts
const sectionRef = useRef<HTMLDivElement>(null);

useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=200%',
          scrub: true,
          pin: true,
        },
      });

      tl.from('.hero-bg', { scale: 1.1, filter: 'blur(6px)' })
        .from('.hero-title span', { yPercent: 120, opacity: 0, stagger: 0.08 }, 0)
        .to('.hero-cta', { y: 0, opacity: 1 }, 0.4);
    });

    mm.add('(max-width: 1023px)', () => {
      gsap.from(sectionRef.current?.querySelectorAll('.reveal') || [], {
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.7,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
        },
      });
    });
  }, sectionRef);

  return () => ctx.revert();
}, []);
```

## Long scrollytelling timeline (one trigger)
```ts
const wrapper = useRef<HTMLDivElement>(null);

useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    gsap.timeline({
      scrollTrigger: {
        trigger: wrapper.current,
        start: 'top top',
        end: '+=400%',
        scrub: true,
        pin: true,
        anticipatePin: 1,
      },
    })
      .addLabel('intro')
      .to('.bg', { scale: 1.05 }, 'intro')
      .from('.panel-1 .copy', { opacity: 0, y: 60 }, '<')
      .addLabel('chapter-1')
      .to('.panel-1', { opacity: 0 }, 'chapter-1')
      .from('.panel-2', { opacity: 0 }, 'chapter-1')
      .addLabel('outro')
      .to('.cta', { y: 0, opacity: 1 }, 'outro');
  }, wrapper);

  return () => ctx.revert();
}, []);
```

## Batch reveals (lightweight)
```ts
ScrollTrigger.batch('.reveal', {
  start: 'top 80%',
  once: true,
  onEnter: batch =>
    gsap.to(batch, { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power2.out' }),
  onLeaveBack: batch =>
    gsap.to(batch, { y: 24, opacity: 0, stagger: 0.08, duration: 0.4, ease: 'power1.out' }),
});
```

## Refresh after assets
```ts
window.addEventListener('load', () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());
```

Notes:
- Keep trigger count low; prefer one timeline with labels per section.
- Use `invalidateOnRefresh: true` when measuring sizes.
- Disable heavy timelines on touch or when `matchMedia` fails to meet targets; provide static fallback.
