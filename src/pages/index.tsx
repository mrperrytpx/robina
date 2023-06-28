import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

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
                <Link className="p-4" href="/profile">
                    Profile
                </Link>
                <Link className="p-4" href="/profile/username">
                    username
                </Link>
                <Link className="p-4" href="/chats">
                    chats
                </Link>
                <Link className="p-4" href="/chats/create">
                    create chat
                </Link>
                <Link className="p-4" href="/chats/1023912">
                    chat id
                </Link>
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
            <Link className="p-4" href="/profile">
                Profile
            </Link>
            <Link className="p-4" href="/profile/username">
                username
            </Link>
            <Link className="p-4" href="/chats">
                chats
            </Link>
            <Link className="p-4" href="/chats/create">
                create chat
            </Link>
            <Link className="p-4" href="/chats/1023912">
                chat id
            </Link>
        </>
    );
}
