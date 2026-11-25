import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const content = contentRef.current;
    if (!overlay || !content) return;

    const radiusVar = "var(--page-radius, 28px)";
    overlay.style.borderRadius = radiusVar;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      gsap.set([overlay, content], { clearProps: "all" });
      return;
    }

    const tl = gsap.timeline();
    tl.set(overlay, { scaleX: 0, transformOrigin: "left center" })
      .to(overlay, {
        duration: 0.25,
        scaleX: 1,
        ease: "power3.out",
      })
      .fromTo(
        content,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.38,
          ease: "power3.out",
        },
        "-=0.12"
      )
      .to(
        overlay,
        {
          duration: 0.28,
          scaleX: 0,
          transformOrigin: "right center",
          ease: "power2.inOut",
        },
        "-=0.18"
      );

    return () => { tl.kill(); };
  }, [location.pathname]);

  return (
    <div className="relative">
      {/* Overlay with its own clipping context */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <div
          ref={overlayRef}
          className="absolute inset-0 scale-x-0 bg-gradient-to-r from-sky-500/30 via-white/5 to-purple-500/25 backdrop-blur-[18px] ring-1 ring-white/5"
          style={{ borderRadius: 'var(--page-radius, 28px)' }}
        />
      </div>
      <div ref={contentRef} className="relative">
        {children}
      </div>
    </div>
  );
}
