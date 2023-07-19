import Link from "next/link";
import { VscAdd } from "react-icons/vsc";

export const CreateChatroom = () => {
    return (
        <Link
            href="/chats?create=1"
            as="/chats/create"
            className="group relative grid aspect-video w-[min(100%,280px)] items-center rounded-xl text-center shadow-lg outline outline-2 hover:outline-sky-500 focus:outline-sky-500"
        >
            <span className="group-hover:hidden">Create New Chatroom</span>
            <div className="absolute inset-0 hidden h-full w-full items-center group-hover:grid">
                <VscAdd className="mx-auto" size={72} />
            </div>
        </Link>
    );
};
