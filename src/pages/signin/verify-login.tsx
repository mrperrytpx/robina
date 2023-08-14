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
                    <VscMail className="hover:fill-glacier-6000 h-20 w-20 select-none fill-glacier-900" />
                    <h1 className="text-center text-2xl uppercase text-glacier-900">
                        <strong>Check your email</strong>
                    </h1>
                </div>
                <p className="text-center">
                    A sign in link has been sent to your email address.
                </p>
                <Link
                    className="mt-2 w-full max-w-[12.5rem] rounded-md border-2 border-black bg-white p-2 text-center font-medium transition-all duration-75 hover:border-glacier-600 hover:bg-glacier-600 hover:text-glacier-50 hover:shadow-sm focus:border-glacier-600 focus:bg-glacier-600 focus:text-glacier-50 focus:shadow-sm disabled:opacity-50"
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
