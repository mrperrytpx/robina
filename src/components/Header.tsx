import Link from "next/link";
import { RiChat1Line } from "react-icons/ri";
import { VscBellDot, VscChromeClose, VscMenu } from "react-icons/vsc";
import { LoadingSpinner } from "./LoadingSpinner";
import { MobileMenu } from "./MobileMenu";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useGetUserPendingInvitesQuery } from "../hooks/useGetUserPendingInvitesQuery";
import DefaultPic from "../../public/default.png";
import Logo from "../../public/logo.png";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const Header = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const session = useSession();
    const pathname = usePathname();

    const pendingInvites = useGetUserPendingInvitesQuery();

    useEffect(() => setIsExpanded(false), [pathname]);

    return (
        <header className="sticky top-0 z-50 grid min-h-[64px] place-items-center items-center bg-sky-500 shadow">
            <div className="flex w-full items-center justify-between px-4 py-2">
                <Link href="/" className="text-3xl text-white">
                    <Image
                        width={100}
                        height={50}
                        src={Logo}
                        alt="Website logo"
                        priority
                    />
                </Link>
                <div className="flex items-center gap-3">
                    {session.status === "loading" ? (
                        <LoadingSpinner color="white" size={36} />
                    ) : null}
                    {session?.data?.user && (
                        <>
                            {pendingInvites.data?.length ? (
                                <Link
                                    className="group px-1 py-2 text-xl font-bold uppercase text-white"
                                    href="/chats"
                                >
                                    <VscBellDot
                                        className="fill-white group-hover:fill-black group-focus:fill-black"
                                        size={28}
                                    />
                                </Link>
                            ) : (
                                <Link
                                    className="group px-1 py-2 text-xl font-bold uppercase text-white"
                                    href="/chats"
                                >
                                    <RiChat1Line
                                        className="fill-white group-hover:fill-black group-focus:fill-black"
                                        size={28}
                                    />
                                </Link>
                            )}
                            <Link
                                className="rounded-full border-2 border-sky-500 hover:border-white"
                                href="/profile"
                                aria-label="Profile"
                            >
                                <Image
                                    className="w-9 rounded-full"
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
