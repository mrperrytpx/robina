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
            className="relative flex aspect-video w-[min(100%,350px)] flex-col items-center justify-center gap-4 rounded-xl bg-gray-950 p-4 text-center shadow-lg hover:outline hover:outline-2 hover:outline-white"
        >
            <span className="mb-4 text-2xl">{name}</span>
            <span className="line-clamp-3 text-xs">{description}</span>
        </Link>
    );
};

// kasnije
