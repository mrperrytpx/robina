import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Head from "next/head";

interface ILayoutProps {
    children: JSX.Element | JSX.Element[];
}

const Layout = ({ children }: ILayoutProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const pathname = usePathname();

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
            <div className="flex min-h-screen flex-col bg-blue-200">
                <header className="sticky top-0 flex h-16 items-center justify-between bg-yellow-500">
                    <p>navbar</p>
                    <button
                        aria-label="Menu"
                        onClick={() => setIsExpanded((old) => !old)}
                        className="select-none text-3xl sm:hidden"
                        role="button"
                    >
                        YOOYOYO
                    </button>
                </header>
                {isExpanded ? (
                    <div className="flex-1 bg-purple-400">Phone</div>
                ) : (
                    <>
                        <main className="flex-1 bg-red-200">{children}</main>
                        <footer className="min-h-[64px]">Footer</footer>
                    </>
                )}
            </div>
        </>
    );
};

export default Layout;
