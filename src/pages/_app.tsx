import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import type { Session } from "next-auth";
import "../styles/globals.css";
import Layout from "./layout";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}
