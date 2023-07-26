import { useRouter } from "next/router";
import {
    useRef,
    useEffect,
    useState,
    ReactNode,
    Dispatch,
    SetStateAction,
} from "react";
import { createPortal } from "react-dom";

interface PortalProps {
    children: ReactNode;
    shouldRoute: boolean;
    isInModal?: boolean;
    setState?: Dispatch<SetStateAction<boolean>>;
}

export const Portal = ({
    shouldRoute,
    children,
    setState,
    isInModal,
}: PortalProps) => {
    const ref = useRef<Element | null>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const close = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (shouldRoute) {
                    router.back();
                } else {
                    setMounted(false);
                }
            }
        };

        if (mounted) window.addEventListener("keydown", close);

        return () => {
            window.removeEventListener("keydown", close);
        };
    }, [mounted, router, shouldRoute]);

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
            if (mounted && setState) setState(false);
            setMounted(false);
        };
    }, [setState, mounted]);

    const handleClickOutsidePortal = async (
        e: React.MouseEvent<HTMLDivElement>
    ) => {
        const target = e.target as HTMLDivElement;
        if (target.id === "bg" && bgRef.current && mounted) {
            if (shouldRoute) {
                router.push("/chats");
            } else {
                setMounted(false);
                if (setState) setState(false);
            }
        }
    };

    return mounted && ref.current
        ? createPortal(
              <div
                  id="bg"
                  role="dialog"
                  ref={bgRef}
                  onClick={handleClickOutsidePortal}
                  className={`fixed inset-0 top-16 flex overflow-y-auto bg-black ${
                      isInModal ? "bg-opacity-0" : "bg-opacity-75"
                  } sm:top-0 sm:items-center sm:justify-center`}
              >
                  {children}
              </div>,
              ref.current
          )
        : null;
};
