import Link from "next/link";
import { useEffect, useState } from "react";

export const CookieBanner = () => {
    const [showCookieHeader, setShowCookieHeader] = useState(false);

    const handleAcceptCookies = () => {
        if (typeof window !== "undefined") {
            localStorage.setItem("yama-cki-accepted", "true");
            setShowCookieHeader(false);
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (
                showCookieHeader ||
                localStorage.getItem("yama-cki-accepted") !== "true"
            ) {
                setShowCookieHeader(true);
            }
        }
    }, [showCookieHeader]);

    if (!showCookieHeader) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 w-full rounded-t-lg bg-indigo-600 p-4 py-8 text-center text-white sm:bottom-2 sm:left-2 sm:w-[500px] sm:rounded-lg">
            <p>
                We use cookies to enhance your experience on our website. By
                continuing to browse, you consent to our{" "}
                <Link
                    className="forcus:text-black underline hover:text-black"
                    href="/tos"
                    prefetch={false}
                >
                    terms of service
                </Link>{" "}
                and use of cookies.
            </p>
            <button
                onClick={handleAcceptCookies}
                className="mt-4 select-none rounded-lg border-2 border-white bg-white px-4 py-2 font-semibold text-black hover:border-black hover:text-sky-500 focus:border-black focus:text-sky-500"
            >
                I understand
            </button>
        </div>
    );
};
