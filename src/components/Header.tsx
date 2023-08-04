import Link from "next/link";
import { VscBellDot, VscChromeClose, VscMenu } from "react-icons/vsc";
import { LoadingSpinner } from "./LoadingSpinner";
import { MobileMenu } from "./MobileMenu";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useGetUserPendingInvitesQuery } from "../hooks/useGetUserPendingInvitesQuery";
import DefaultPic from "../../public/default-darkbg.png";
import LogoWhite from "../../public/logo-white.webp";
import FallbackLogoWhite from "../../public/logo-white.png";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ImageWithFallback } from "./ImageWithFallback";

export const Header = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const session = useSession();
    const pathname = usePathname();

    const pendingInvites = useGetUserPendingInvitesQuery();

    useEffect(() => setIsExpanded(false), [pathname]);

    return (
        <header className="sticky top-0 z-50 grid min-h-[64px] place-items-center items-center bg-glacier-600 shadow">
            <div className="flex w-full items-center justify-between px-4 py-2">
                <Link
                    prefetch={false}
                    href="/"
                    aria-label="Go to the homepage."
                >
                    <ImageWithFallback
                        width={48}
                        height={48}
                        src={LogoWhite}
                        alt="Website logo"
                        priority
                        fallback={FallbackLogoWhite}
                        className="select-none"
                    />
                </Link>
                <div className="flex items-center gap-3">
                    {session.status === "loading" ? (
                        <LoadingSpinner color="white" size={36} />
                    ) : null}
                    {session.data?.user && (
                        <>
                            {(pendingInvites.data?.length || 0) >= 1 && (
                                <Link
                                    prefetch={false}
                                    className="group select-none px-1 py-2 text-xl font-bold uppercase text-white"
                                    href="/chats"
                                    aria-label="New pending chat invites."
                                >
                                    <VscBellDot
                                        className="fill-white group-hover:fill-black group-focus:fill-black"
                                        size={28}
                                    />
                                </Link>
                            )}
                            <Link
                                prefetch={false}
                                className="mt-[2px] hidden border-b border-glacier-600 px-2 py-0.5 text-lg font-semibold uppercase text-white hover:border-glacier-100 sm:inline-block"
                                href="/chats"
                            >
                                Chats
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="mt-[2px] hidden border-b border-glacier-600 px-2 py-0.5 text-lg font-semibold uppercase text-white hover:border-glacier-100 sm:inline-block"
                            >
                                Sign out
                            </button>
                            <Link
                                prefetch={false}
                                className="rounded-full border-2 border-white shadow hover:border-black focus:border-black"
                                href="/profile"
                                aria-label="Profile"
                            >
                                <Image
                                    className="w-9 select-none rounded-full"
                                    width={100}
                                    height={100}
                                    src={
                                        session?.data.user?.image || DefaultPic
                                    }
                                    alt="User's profile"
                                />
                            </Link>
                        </>
                    )}

                    {!session.data?.user && session.status !== "loading" && (
                        <Link
                            prefetch={false}
                            className="vertical mt-[2px] hidden px-1 py-2 text-lg font-semibold uppercase text-white  hover:underline focus:underline sm:inline-block"
                            href="/signin"
                        >
                            Sign in
                        </Link>
                    )}
                    <button
                        aria-label="Menu"
                        onClick={() => setIsExpanded((old) => !old)}
                        className="select-none text-3xl sm:hidden"
                        role="button"
                    >
                        {isExpanded ? (
                            <VscChromeClose fill="white" />
                        ) : (
                            <VscMenu fill="white" />
                        )}
                    </button>
                </div>
            </div>
            {isExpanded && (
                <MobileMenu
                    isExpanded={isExpanded}
                    setIsExpanded={setIsExpanded}
                />
            )}
        </header>
    );
};
