import { RefObject, useEffect, useState } from "react";

type TIntersectionObserverOptions = {
    root?: Element | null;
    rootMargin?: string;
    threshold?: number | number[];
};

export const useIntersectionObserver = (
    ref: RefObject<HTMLDivElement>,
    options: TIntersectionObserverOptions
) => {
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const current = ref.current as HTMLDivElement;

        const hasIOSupport = !!window.IntersectionObserver;

        if (!hasIOSupport || !current) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        observer.observe(current);

        return () => {
            setIsIntersecting(false);
            observer.disconnect();
        };
    }, [ref, options]);

    return isIntersecting;
};
