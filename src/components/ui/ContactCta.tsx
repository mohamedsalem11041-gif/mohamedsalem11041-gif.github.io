import clsx from "clsx";
import gsap from "gsap";
import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";

type ContactCtaProps = {
  children?: ReactNode;
  className?: string;
  fullWidth?: boolean;
  to?: string;
};

const ContactCta = ({
  children,
  className,
  fullWidth = false,
  to = "/contact",
}: ContactCtaProps) => {
  const buttonRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const shine = el.querySelector<HTMLElement>(".contact-cta__shine");

    const hoverTl = gsap.timeline({
      paused: true,
      defaults: { ease: "power2.out" },
    });

    hoverTl.to(
      el,
      {
        "--border-alpha": 0.9,
        "--glow-alpha": 0.6,
        duration: 0.45,
        scale: 1.02,
      },
      0
    );

    if (shine) {
      gsap.set(shine, { xPercent: -140 });
      hoverTl.to(
        shine,
        { xPercent: 140, duration: 0.9, ease: "power1.out" },
        0
      );
    }

    const handleEnter = () => hoverTl.play();
    const handleLeave = () => {
      hoverTl.reverse();
      gsap.to(el, {
        "--pointer-x": "50%",
        "--pointer-y": "50%",
        duration: 0.5,
        ease: "power3.out",
      });
    };

    const handleMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      gsap.to(el, {
        "--pointer-x": `${x}%`,
        "--pointer-y": `${y}%`,
        duration: 0.25,
        ease: "power2.out",
      });
    };

    el.addEventListener("pointerenter", handleEnter);
    el.addEventListener("pointerleave", handleLeave);
    el.addEventListener("pointermove", handleMove);

    return () => {
      el.removeEventListener("pointerenter", handleEnter);
      el.removeEventListener("pointerleave", handleLeave);
      el.removeEventListener("pointermove", handleMove);
      hoverTl.kill();
    };
  }, []);

  return (
    <Link
      to={to}
      ref={buttonRef}
      className={clsx("contact-cta", fullWidth && "contact-cta--full", className)}
    >
      <span className="contact-cta__halo" aria-hidden />
      <span className="contact-cta__shine" aria-hidden />
      <span className="contact-cta__label">
        {children ?? "Let's Collaborate"}
        <span aria-hidden className="contact-cta__icon">
          &rarr;
        </span>
      </span>
    </Link>
  );
};

export default ContactCta;
