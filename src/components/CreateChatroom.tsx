import Link from "next/link";
import { VscAdd } from "react-icons/vsc";

export const CreateChatroom = () => {
    return (
        <Link
            href="/chats/create"
            className="group relative grid aspect-video w-[min(100%,350px)] items-center rounded-xl border-black bg-gray-950 text-center shadow-lg"
        >
            <span className="group-hover:hidden">Create New Chatroom</span>
            <div className="absolute inset-0 hidden h-full w-full items-center group-hover:grid">
                <VscAdd className="mx-auto" size={72} />
            </div>
        </Link>
    );
};