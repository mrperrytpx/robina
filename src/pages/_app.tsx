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

const poppins = Poppins({
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    subsets: ["latin"],
});

const toastProps: ToastContainerProps = {
    autoClose: 1500,
    theme: "light",
    limit: 5,
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
        <SessionProvider session={session}>
            <QueryClientProvider client={queryClient}>
                <Layout>
                    <style jsx global>{`
                        html,
                        body {
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
    );
}

// const queryClient = new QueryClient();

// await queryClient.prefetchQuery(["store"], getStoreData);

// return {
//     props: {
//         dehydratedState: dehydrate(queryClient),
//     },
// };
