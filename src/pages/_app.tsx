import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import type { Session } from "next-auth";
import "../styles/globals.css";
import Layout from "./layout";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";
import type { ToastContainerProps } from "react-toastify/dist/types";
import "react-toastify/dist/ReactToastify.css";
import { Poppins } from "next/font/google";
import Head from "next/head";

const poppins = Poppins({
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    subsets: ["latin"],
});

const toastProps: ToastContainerProps = {
    autoClose: 1500,
    theme: "light",
    limit: 5,
    style: {
        fontWeight: 600,
    },
};

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        retry: 0,
                    },
                },
            })
    );

    return (
        <>
            <Head>
                <title>YetAnotherMessagingApp</title>
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" href="/favicon.png" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta
                    name="description"
                    content="YetAnotherMessagingApp - World's simplest chatroom website."
                />
                <meta property="og:title" content="YetAnotherMessagingApp" />
                <meta
                    property="og:image"
                    content={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/meta-thumbnail.png`}
                />
                <meta property="og:type" content="website" />
                <meta
                    property="og:url"
                    content={`${process.env.NEXT_PUBLIC_WEBSITE_URL}`}
                />
                <meta
                    property="og:description"
                    content="YetAnotherMessagingApp - World's simplest chatroom website."
                />
                <meta name="theme-color" content="#3a8ca0" />
            </Head>
            <SessionProvider session={session}>
                <QueryClientProvider client={queryClient}>
                    <Layout>
                        <style jsx global>{`
                            html,
                            body,
                            .Toastify {
                                font-family: ${poppins.style.fontFamily};
                            }
                        `}</style>
                        <Component {...pageProps} />
                        <ToastContainer {...toastProps} />
                        <ReactQueryDevtools
                            initialIsOpen={false}
                            position="bottom-right"
                        />
                    </Layout>
                </QueryClientProvider>
            </SessionProvider>
        </>
    );
}
