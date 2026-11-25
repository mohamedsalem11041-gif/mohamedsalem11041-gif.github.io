import { useEffect, useRef } from "react";

const CIRCLE_COUNT = 20;

// Sky-blue gradient colors matching the website theme
const colors = [
  "#7dd3fc", // ice-400
  "#6dd0fb",
  "#5dcdfa",
  "#4dc9f9",
  "#3dc6f8",
  "#2dc3f7",
  "#1dbff6",
  "#0dbcf5",
  "#0ab8f0",
  "#0ab4eb",
  "#0aafe6",
  "#0aabe1",
  "#0aa6dc",
  "#0aa2d7",
  "#0a9dd2",
  "#0a99cd",
  "#0a94c8",
  "#0a90c3",
  "#0a8bbe",
  "#0ea5e9", // sky-500
];

interface Circle {
  el: HTMLDivElement;
  x: number;
  y: number;
}

export default function CursorTrail() {
  const containerRef = useRef<HTMLDivElement>(null);
  const circlesRef = useRef<Circle[]>([]);
  const coordsRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);

  useEffect(() => {
    // Skip on touch devices and reduced motion preference
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (isTouchDevice || prefersReduced) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Create circles
    const circles: Circle[] = [];
    for (let i = 0; i < CIRCLE_COUNT; i++) {
      const el = document.createElement("div");
      el.className = "cursor-trail-circle";
      el.style.backgroundColor = colors[i % colors.length];
      container.appendChild(el);
      circles.push({ el, x: 0, y: 0 });
    }
    circlesRef.current = circles;

    // Hide real cursor on the entire page
    document.body.style.cursor = "none";
    document.documentElement.style.cursor = "none";

    // Add cursor:none to all interactive elements
    const style = document.createElement("style");
    style.id = "cursor-trail-style";
    style.textContent = `
      *, *::before, *::after {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      coordsRef.current.x = e.clientX;
      coordsRef.current.y = e.clientY;
    };

    // Animate circles
    const animateCircles = () => {
      let x = coordsRef.current.x;
      let y = coordsRef.current.y;

      circles.forEach((circle, index) => {
        circle.el.style.left = `${x - 12}px`;
        circle.el.style.top = `${y - 12}px`;
        circle.el.style.transform = `scale(${(circles.length - index) / circles.length})`;

        circle.x = x;
        circle.y = y;

        const nextCircle = circles[index + 1] || circles[0];
        x += (nextCircle.x - x) * 0.3;
        y += (nextCircle.y - y) * 0.3;
      });

      animationRef.current = requestAnimationFrame(animateCircles);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animationRef.current = requestAnimationFrame(animateCircles);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationRef.current);
      
      // Restore cursor
      document.body.style.cursor = "";
      document.documentElement.style.cursor = "";
      
      // Remove style
      const styleEl = document.getElementById("cursor-trail-style");
      if (styleEl) styleEl.remove();

      // Clean up circles
      circles.forEach((circle) => circle.el.remove());
    };
  }, []);

  return <div ref={containerRef} className="cursor-trail-container" />;
}
