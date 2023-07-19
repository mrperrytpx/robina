import Link from "next/link";

interface IChatroomCard {
    id: string;
    name: string;
    description: string;
}

export const ChatroomCard = ({ id, name, description }: IChatroomCard) => {
    return (
        <Link
            href={`/chats/${id}`}
            aria-label={`Visit a chatroom named ${name}`}
            className="relative flex aspect-video w-[min(100%,280px)] flex-col items-center justify-center gap-4 rounded-xl p-4 outline outline-2 hover:outline-sky-500 focus:outline-sky-500"
        >
            <span className="mb-4 line-clamp-2 text-xl">{name}</span>
            <span className="line-clamp-3 text-xs">{description}</span>
        </Link>
    );
};
