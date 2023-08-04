import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRef, useEffect, SetStateAction, Dispatch } from "react";
import { VscGithub } from "react-icons/vsc";

interface IMobileMenuProps {
    isExpanded: boolean;
    setIsExpanded: Dispatch<SetStateAction<boolean>>;
}

export const MobileMenu = ({ isExpanded, setIsExpanded }: IMobileMenuProps) => {
    const mobileRef = useRef<HTMLDivElement | null>(null);

    const session = useSession();

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
            className="b-[64px] absolute inset-0 top-16 z-20 flex h-[100svh] w-full flex-col items-center bg-glacier-50 px-4 py-8"
        >
            {session.data?.user && (
                <span className="text-center font-mono text-xl">
                    Logged in as{" "}
                    <Link className="hover:underline" href="/profile">
                        <strong>{session.data.user.username}</strong>
                    </Link>
                </span>
            )}

            {session.data?.user ? (
                <>
                    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-4">
                        <Link
                            prefetch={false}
                            className="p-2 text-center text-2xl hover:text-glacier-600 hover:underline focus:text-glacier-600 focus:underline"
                            href="/profile"
                        >
                            Profile
                        </Link>
                        <Link
                            prefetch={false}
                            className="p-2 text-center text-2xl hover:text-glacier-600 hover:underline focus:text-glacier-600 focus:underline"
                            href="/chats"
                        >
                            Chatrooms
                        </Link>
                        <Link
                            prefetch={false}
                            className="p-2 text-center text-2xl hover:text-glacier-600 hover:underline focus:text-glacier-600 focus:underline"
                            href="/chats/join"
                        >
                            Join Chatroom
                        </Link>

                        <button
                            className="p-2 text-center text-2xl hover:text-glacier-600 hover:underline focus:text-glacier-600 focus:underline"
                            onClick={() => signOut()}
                        >
                            Sign Out
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-4">
                    <Link
                        prefetch={false}
                        className="select-none p-2 text-center text-2xl hover:text-glacier-600 hover:underline focus:text-glacier-600 focus:underline"
                        href="/signin"
                    >
                        Sign In
                    </Link>
                </div>
            )}
            <a
                target="_blank"
                rel="noreferrer"
                href="https://github.com/mrperrytpx/robina/"
                aria-label="Github"
                className="group mt-auto select-none"
            >
                <VscGithub
                    className="group-hover:fill-glacier-600 group-focus:fill-glacier-600"
                    size={56}
                />
            </a>
            <div className="h-16" />
        </div>
    );
};
