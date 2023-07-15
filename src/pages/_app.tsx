import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import type { Session } from "next-auth";
import "../styles/globals.css";
import Layout from "./layout";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

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
                    <Component {...pageProps} />
                    <ReactQueryDevtools
                        initialIsOpen={false}
                        position="top-left"
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
