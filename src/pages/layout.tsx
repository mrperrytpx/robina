import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Head from "next/head";
import { VscMenu, VscChromeClose } from "react-icons/vsc";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { LoadingSpinner } from "../components/LoadingSpinner";

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
            <div className="flex min-h-screen flex-col">
                <header className="sticky top-0 z-50 grid min-h-[64px] place-items-center items-center border-b-2 border-slate-400 bg-slate-900">
                    <div className="flex w-full max-w-screen-2xl items-center justify-between px-4 py-2">
                        <Link href="/" className="text-3xl">
                            LOGO
                        </Link>
                        <div className="flex items-center gap-4">
                            {session.status === "loading" ? (
                                <LoadingSpinner size={28} />
                            ) : null}
                            {session?.data?.user && (
                                <Link
                                    className="rounded-full p-0.5"
                                    href="/profile"
                                    aria-label="Profile"
                                >
                                    <Image
                                        className="w-7 rounded-full"
                                        width={100}
                                        height={100}
                                        src={session?.data.user?.image!}
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
                                {isExpanded ? <VscChromeClose /> : <VscMenu />}
                            </button>
                        </div>
                    </div>
                </header>
                {isExpanded ? (
                    <div className="h-[calc(max(600px,100svh)-64px)] px-4 py-2">
                        Phone
                    </div>
                ) : (
                    <>
                        <main className="mx-auto flex min-h-[calc(max(600px,100svh)-64px)] w-full max-w-screen-2xl flex-1 px-4 py-2">
                            {children}
                        </main>
                        <footer className="sticky top-0 grid min-h-[128px] place-items-center items-center border-t-2 border-slate-400 bg-slate-900">
                            Footer
                        </footer>
                    </>
                )}
            </div>
        </>
    );
};

export default Layout;
