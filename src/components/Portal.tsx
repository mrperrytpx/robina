import { useRouter } from "next/router";
import { useRef, useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
    children: ReactNode;
}

export const Portal = ({ children }: PortalProps) => {
    const ref = useRef<Element | null>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const close = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                router.push("/chats");
            }
        };

        if (mounted) window.addEventListener("keydown", close);
        return () => {
            window.removeEventListener("keydown", close);
        };
    }, [mounted, router]);

    useEffect(() => {
        if (typeof window != "undefined" && window.document) {
            if (mounted) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "unset";
            }
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [mounted]);

    useEffect(() => {
        ref.current = document.querySelector<HTMLElement>("#portal");
        setMounted(true);

        return () => {
            ref.current = null;
            setMounted(false);
        };
    }, []);

    const handleClosePortal = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        if (target.id === "bg" && bgRef.current && mounted) {
            router.push("/chats");
        }
    };

    return mounted && ref.current
        ? createPortal(
              <div
                  id="bg"
                  role="dialog"
                  ref={bgRef}
                  onClick={handleClosePortal}
                  className="fixed inset-0 top-16 flex overflow-y-auto bg-black bg-opacity-75 sm:top-0 sm:items-center sm:justify-center"
              >
                  {children}
              </div>,
              ref.current
          )
        : null;
};
