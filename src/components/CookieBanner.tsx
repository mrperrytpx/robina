import Link from "next/link";
import { useEffect, useState } from "react";

export const CookieBanner = () => {
    const [showCookieHeader, setShowCookieHeader] = useState(false);

    const handleAcceptCookies = () => {
        localStorage.setItem("yama-cki-accepted", "true");
        setShowCookieHeader(false);
    };

    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            localStorage.getItem("yama-cki-accepted") !== "true"
        ) {
            setShowCookieHeader(true);
        }
    }, []);

    if (!showCookieHeader) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 w-full rounded-t-lg bg-glacier-200 p-4 py-8 text-center text-glacier-950 sm:bottom-2 sm:left-2 sm:w-[31.25rem] sm:rounded-lg">
            <p>
                We use cookies to enhance your experience on our website. By
                continuing to browse, you consent to our{" "}
                <Link
                    className="underline hover:text-red-600 focus:text-red-600"
                    href="/tos"
                    prefetch={false}
                >
                    terms of service
                </Link>{" "}
                and use of cookies.
            </p>
            <button
                onClick={handleAcceptCookies}
                className="transition-color mt-4 select-none rounded-lg border-2 border-white bg-white px-4 py-2 font-semibold text-glacier-950 duration-75 hover:border-glacier-600 hover:bg-glacier-600 hover:text-glacier-50 focus:border-glacier-600 focus:bg-glacier-600 focus:text-glacier-50"
            >
                I understand
            </button>
        </div>
    );
};
