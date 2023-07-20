import Link from "next/link";
import { VscAdd } from "react-icons/vsc";

export const LoadingChatroomCard = () => {
    return (
        <div className="group relative grid aspect-video w-[min(100%,280px)] items-center rounded-xl p-6 shadow-lg outline outline-2">
            <div className="mb-4 line-clamp-2 h-6 w-full animate-pulse rounded-lg bg-gray-300 text-xl" />
            <div className="flex flex-col gap-0.5">
                <div className="line-clamp-3 h-4 w-full animate-pulse rounded-lg bg-gray-300 text-xs" />
                <div className="line-clamp-3 h-4 w-full animate-pulse rounded-lg bg-gray-300 text-xs" />
            </div>
        </div>
    );
};

interface INewChatroomCardProps {
    title: string;
    href: string;
    hrefAs: string;
}

export const NewChatroomCard = ({
    title,
    href,
    hrefAs,
}: INewChatroomCardProps) => {
    return (
        <Link
            href={href}
            as={hrefAs}
            className="group relative grid aspect-video w-[min(100%,280px)] items-center rounded-xl text-center shadow-md outline outline-2 hover:shadow-sky-500 hover:outline-sky-500 focus:shadow-sky-500 focus:outline-sky-500"
        >
            <span className="group-hover:hidden">{title}</span>
            <div className="absolute inset-0 hidden h-full w-full items-center group-hover:grid">
                <VscAdd className="mx-auto" size={72} />
            </div>
        </Link>
    );
};

interface IEnterChatroomCard {
    id: string;
    name: string;
    description: string;
}

export const EnterChatroomCard = ({
    id,
    name,
    description,
}: IEnterChatroomCard) => {
    return (
        <Link
            href={`/chats/${id}`}
            aria-label={`Visit a chatroom named ${name}`}
            className="relative flex aspect-video w-[min(100%,280px)] flex-col items-center justify-center gap-4 rounded-xl p-4 shadow-md outline outline-2 hover:shadow-sky-500 hover:outline-sky-500  focus:shadow-sky-500 focus:outline-sky-500"
        >
            <span className="line-clamp-2 w-full break-words text-center text-xl">
                {name}
            </span>
            <span className="line-clamp-3 w-full break-words text-center text-xs">
                {description}
            </span>
        </Link>
    );
};
