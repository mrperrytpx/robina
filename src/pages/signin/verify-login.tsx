import React from "react";
import { VscMail } from "react-icons/vsc";
import Head from "next/head";
import Link from "next/link";
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";

const VerifyRequestPage = () => {
    return (
        <>
            <Head>
                <title>Check your Inbox</title>
            </Head>
            <div className="mx-auto mt-12 flex w-full max-w-screen-sm flex-col items-center gap-4 rounded-lg p-8">
                <div className="flex w-full flex-col items-center justify-center">
                    <VscMail size="80" className="select-none" />
                    <h1 className="text-center text-2xl uppercase">
                        <strong>Check your email</strong>
                    </h1>
                </div>
                <p className="text-center">
                    A sign in link has been sent to your email address.
                </p>
                <Link
                    className="mt-2 w-full max-w-[200px] rounded-md border-2 border-black p-2 text-center   font-medium hover:border-sky-500 hover:bg-sky-500 hover:text-white hover:shadow-sm focus:border-sky-500 focus:bg-sky-500 focus:text-white focus:shadow-sm disabled:opacity-50"
                    href="/"
                >
                    Back to Homepage
                </Link>
            </div>
        </>
    );
};

export default VerifyRequestPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getSession(context);

    // If the user is already logged in, redirect.
    // Note: Make sure not to redirect to the same page
    // To avoid an infinite loop!
    if (session) {
        return { redirect: { destination: "/" } };
    }

    return {
        props: {},
    };
}
