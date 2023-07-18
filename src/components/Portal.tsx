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
                setMounted(false);
                router.back();
            }
        };

        window.addEventListener("keydown", close);
        return () => {
            window.removeEventListener("keydown", close);
        };
    }, [setMounted]);

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
    }, []);

    return mounted && ref.current
        ? createPortal(
              <>
                  <div
                      ref={bgRef}
                      className="fixed inset-0 z-40 bg-slate-800 bg-opacity-60"
                  />
                  <div
                      role="dialog"
                      className="fixed inset-0 z-50 flex max-h-screen items-center justify-center overflow-y-auto p-1 opacity-100"
                  >
                      {children}
                  </div>
              </>,
              ref.current
          )
        : null;
};
