import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Head from "next/head";
import { VscMenu, VscChromeClose } from "react-icons/vsc";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { MobileMenu } from "../components/MobileMenu";
import { ErrorBoundary } from "../components/ErrorBoundary";
import DefaultPic from "../../public/default.png";

interface ILayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: ILayoutProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const pathname = usePathname();
    const session = useSession();

    useEffect(() => setIsExpanded(false), [pathname]);

    return (
        <>
            <Head>
                <title>Yet another messaging app</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="relative flex min-h-[100svh] flex-col">
                <header className="sticky top-0 z-50 grid min-h-[64px] place-items-center items-center border-b-2 border-black bg-sky-500">
                    <div className="flex w-full items-center justify-between px-4 py-2">
                        <Link href="/" className="text-3xl text-sky-50">
                            LOGO
                        </Link>
                        <div className="flex items-center gap-4">
                            {session.status === "loading" ? (
                                <LoadingSpinner size={36} />
                            ) : null}
                            {session?.data?.user && (
                                <Link
                                    className="rounded-full p-0.5"
                                    href="/profile"
                                    aria-label="Profile"
                                >
                                    <Image
                                        className="w-9 rounded-full"
                                        width={100}
                                        height={100}
                                        src={
                                            session?.data.user?.image ||
                                            DefaultPic
                                        }
                                        alt="User's profile"
                                    />
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
                <ErrorBoundary>
                    <main className="mx-auto flex min-h-[calc(100svh-64px)] w-full flex-1">
                        {children}
                    </main>
                </ErrorBoundary>
            </div>
        </>
    );
};

export default Layout;
