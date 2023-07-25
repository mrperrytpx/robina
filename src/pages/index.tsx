import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Footer } from "../components/Footer";

export default function Home() {
    const session = useSession();

    if (session.status === "authenticated") {
        return (
            <div className="flex w-full flex-1 flex-col items-center">
                <div className="flex h-full w-full max-w-screen-lg flex-col gap-4">
                    <button
                        className="w-40 bg-white p-2 text-black shadow-md"
                        onClick={() => signOut()}
                    >
                        Sign out
                    </button>
                    <Link className="p-4" href="/profile">
                        Profile
                    </Link>
                    <Link className="p-4" href="/force-username">
                        username
                    </Link>
                    <Link className="p-4" href="/chats">
                        chats
                    </Link>
                    <Link className="p-4" href="/chats/create">
                        create chat
                    </Link>
                    <Link className="p-4" href="/chats/join">
                        join chat
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex w-full flex-1 flex-col items-center">
            <div className="flex h-full w-full max-w-screen-lg flex-col gap-4">
                <button
                    className="w-40 bg-white p-2 text-black shadow-md"
                    onClick={() => signIn()}
                >
                    Sign In
                </button>
                <Link className="p-4" href="/profile">
                    Profile
                </Link>
                <Link className="p-4" href="/force-username">
                    username
                </Link>
                <Link className="p-4" href="/chats">
                    chats
                </Link>
                <Link className="p-4" href="/chats/create">
                    create chat
                </Link>
                <Link className="p-4" href="/chats/join">
                    join chat
                </Link>
            </div>

            <Footer />
        </div>
    );
}
