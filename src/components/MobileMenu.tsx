import { useRef, useEffect, SetStateAction, Dispatch } from "react";

interface IMobileMenuProps {
    isExpanded: boolean;
    setIsExpanded: Dispatch<SetStateAction<boolean>>;
}

export const MobileMenu = ({ isExpanded, setIsExpanded }: IMobileMenuProps) => {
    const mobileRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (typeof window != "undefined" && window.document) {
            if (isExpanded) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "unset";
            }
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isExpanded]);

    useEffect(() => {
        mobileRef.current = document.querySelector<HTMLDivElement>("#menu");
        setIsExpanded(true);
    }, [setIsExpanded]);

    return (
        <div
            id="menu"
            ref={mobileRef}
            className="absolute inset-0 top-16 z-20 h-[calc(100svh-64px)] w-full bg-white px-4 py-2"
        >
            Phone dasd asds
        </div>
    );
};
