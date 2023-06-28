import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
    const session = useSession();

    if (session.status === "authenticated") {
        return (
            <div>
                <p>Signed in as {session.data?.user?.email}</p>
                <button
                    className="w-40 bg-white p-2 text-black shadow-md"
                    onClick={() => signOut()}
                >
                    Sign out
                </button>
            </div>
        );
    }

    return (
        <>
            <div>Yo</div>
            <button
                className="w-40 bg-white p-2 text-black shadow-md"
                onClick={() => signIn()}
            >
                Sign in
            </button>
        </>
    );
}
