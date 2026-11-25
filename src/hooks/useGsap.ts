
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useGsap(
    effect: (ctx: gsap.Context) => void | (() => void),
    deps: React.DependencyList = []
) {
    const scope = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(effect, scope);
        return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return scope;
}
