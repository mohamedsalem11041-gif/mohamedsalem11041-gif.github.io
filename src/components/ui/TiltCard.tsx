
import { useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    glowColor?: 'sky' | 'amber' | 'purple' | 'emerald' | 'none';
}

export default function TiltCard({ children, className, onClick, glowColor = 'sky' }: TiltCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        card.style.transition = "transform 220ms ease-out, box-shadow 220ms ease-out";

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        };

        const handleMouseLeave = () => {
            card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
        };

        card.addEventListener("mousemove", handleMouseMove);
        card.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            card.removeEventListener("mousemove", handleMouseMove);
            card.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    const glowClasses = {
        sky: 'hover:shadow-[0_8px_40px_-12px_rgba(14,165,233,0.6)]',
        amber: 'hover:shadow-[0_8px_40px_-12px_rgba(245,158,11,0.5)]',
        purple: 'hover:shadow-[0_8px_40px_-12px_rgba(168,85,247,0.5)]',
        emerald: 'hover:shadow-[0_8px_40px_-12px_rgba(16,185,129,0.5)]',
        none: '',
    };

    return (
        <div
            ref={cardRef}
            onClick={onClick}
            className={cn(
                "glass relative transform-gpu rounded-2xl transition-all duration-200",
                glowClasses[glowColor],
                className
            )}
        >
            {/* Glossy reflection gradient */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 blur-md transition-all duration-500 group-hover:animate-shine" />
            </div>
            {children}
        </div>
    );
}
