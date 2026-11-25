import { useEffect } from "react";
import type { RefObject } from "react";
import gsap from "gsap";

interface ModalAnimationOptions {
  isClosing: boolean;
  onClosed: () => void;
  overlayRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  morphRef?: RefObject<SVGPathElement | null>;
}

export function useModalAnimation({
  isClosing,
  onClosed,
  overlayRef,
  panelRef,
  morphRef,
}: ModalAnimationOptions) {
  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    const morph = morphRef?.current;
    if (!overlay || !panel) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // Keep segment counts identical to avoid morph glitches
    const closedPath = "M 0 100 Q 50 100 100 100 L 100 100 L 0 100 Z";
    const openPath = "M 0 100 Q 50 0 100 100 L 100 100 L 0 100 Z";

    const tl = gsap.timeline();
    if (morph) {
      gsap.set(morph, {
        attr: { d: closedPath },
        transformOrigin: "50% 100%",
        transformBox: "fill-box",
      });
      tl.to(
        morph,
        { attr: { d: openPath }, duration: 0.45, ease: "power2.inOut" },
        0
      );
    }
    tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "linear" }, 0)
      .fromTo(
        panel,
        { opacity: 0, y: 24, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" },
        "-=0.1"
      );

    return () => { tl.kill(); };
  }, [overlayRef, panelRef, morphRef]);

  useEffect(() => {
    if (!isClosing) return;

    const overlay = overlayRef.current;
    const panel = panelRef.current;
    const morph = morphRef?.current;
    if (!overlay || !panel) {
      onClosed();
      return;
    }

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      onClosed();
      return;
    }

    const closedPath = "M 0 100 Q 50 100 100 100 L 100 100 L 0 100 Z";

    const tl = gsap.timeline({ onComplete: onClosed });
    tl.to(panel, {
      opacity: 0,
      y: 16,
      scale: 0.97,
      duration: 0.25,
      ease: "power1.in",
    });
    if (morph) {
      tl.to(
        morph,
        {
          attr: { d: closedPath },
          duration: 0.25,
          ease: "power1.inOut",
          transformOrigin: "50% 100%",
          transformBox: "fill-box",
        },
        0
      );
    }
    tl.to(
      overlay,
      { opacity: 0, duration: 0.2, ease: "power1.in" },
      "-=0.12"
    );

    return () => { tl.kill(); };
  }, [isClosing, onClosed, overlayRef, panelRef, morphRef]);
}
