import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
    const session = useSession();

    if (session.status === "authenticated") {
        return (
            <div className="flex flex-col items-center gap-4">
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
                <Link className="p-4" href="/chats/join">
                    join chat
                </Link>

                <footer className="sticky top-0 grid min-h-[128px] place-items-center items-center border-t-2 border-slate-400 bg-sky-100">
                    Footer
                </footer>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4">
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
            <Link className="p-4" href="/chats/join">
                join chat
            </Link>
            <footer className="sticky top-0 grid min-h-[128px] place-items-center items-center border-t-2 border-slate-400 bg-sky-100">
                Footer
            </footer>
        </div>
    );
}
