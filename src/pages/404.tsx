import Head from "next/head";
import Link from "next/link";

const Custom404 = () => {
    return (
        <>
            <Head>
                <title>You&apos;re lost 😱</title>
            </Head>
            <div className="mx-auto flex max-h-[calc(100svh-4rem)] w-full max-w-screen-lg flex-col items-center justify-center px-8 py-4 text-glacier-900">
                <div className="flex flex-col items-center gap-4">
                    <span className="text-5xl">🤨</span>
                    <p className="text-center text-2xl font-semibold">
                        You seem lost.
                    </p>
                    <p className="text-center text-xl">
                        Go back{" "}
                        <Link
                            className="uppercase hover:underline focus:underline"
                            href="/"
                        >
                            <strong>home</strong>
                        </Link>{" "}
                        or just... stay here?
                    </p>
                </div>
            </div>
        </>
    );
};

export default Custom404;
