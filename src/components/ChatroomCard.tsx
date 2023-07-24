import Link from "next/link";
import { VscAdd, VscCheck, VscChromeClose } from "react-icons/vsc";
import { useJoinChatroomMutation } from "../hooks/useJoinChatroomMutation";
import { TChatroomInvite } from "../hooks/useGetChatroomPendingInvitesQuery";
import { LoadingSpinner } from "./LoadingSpinner";

interface IInviteChatroomCardProps {
    chatroom: TChatroomInvite;
}

export const InviteChatroomCard = ({ chatroom }: IInviteChatroomCardProps) => {
    const joinChatroom = useJoinChatroomMutation();

    const handleAcceptInvite = async () => {
        const response = await joinChatroom.mutateAsync({
            invite: chatroom.invite_link.value,
        });

        if (!response.ok) {
            const error = await response.text();
            console.log(error);
            return;
        }
    };

    return (
        <div className="group relative flex aspect-video w-[min(100%,280px)] flex-col items-center justify-center gap-4 rounded-xl p-4 shadow-md outline outline-2 hover:shadow-sky-500  hover:outline-sky-500 focus:shadow-sky-500 focus:outline-sky-500">
            <span className="line-clamp-2 w-full break-words text-center text-xl group-hover:line-clamp-none group-hover:hidden group-focus:line-clamp-none">
                {chatroom.name}
            </span>
            <span className="line-clamp-3 w-full break-words text-center text-xs group-hover:line-clamp-none group-hover:hidden group-focus:line-clamp-none">
                {chatroom.description}
            </span>
            <div className="absolute inset-0 hidden h-full w-full items-center justify-between group-hover:flex">
                <button
                    onClick={handleAcceptInvite}
                    disabled={joinChatroom.isLoading}
                    className="group/button mx-auto rounded-full p-1"
                >
                    {joinChatroom.isLoading ? (
                        <LoadingSpinner size={50} color="#0ea5e9" />
                    ) : (
                        <VscCheck
                            className="fill-black group-hover/button:fill-sky-500 group-focus/button:fill-sky-500"
                            size={72}
                        />
                    )}
                </button>
                <button className="group/button mx-auto rounded-full p-1">
                    <VscChromeClose
                        className="fill-black group-hover/button:fill-red-600 group-focus/button:fill-red-600"
                        size={72}
                    />
                </button>
            </div>
        </div>
    );
};

export const LoadingChatroomCard = () => {
    return (
        <div className="group relative grid aspect-video w-[min(100%,280px)] items-center rounded-xl p-6 shadow-lg outline outline-2">
            <div className="mb-4 h-6 w-full animate-pulse rounded-lg bg-gray-300" />
            <div className="flex flex-col gap-0.5">
                <div className="h-4 w-full animate-pulse rounded-lg bg-gray-300" />
                <div className="h-4 w-full animate-pulse rounded-lg bg-gray-300" />
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
            className="group relative flex aspect-video w-[min(100%,280px)] flex-col items-center justify-center gap-4 rounded-xl p-4 shadow-md outline outline-2 hover:shadow-sky-500  hover:outline-sky-500 focus:shadow-sky-500 focus:outline-sky-500"
        >
            <span className="line-clamp-2 w-full break-words text-center text-xl group-hover:line-clamp-none group-focus:line-clamp-none">
                {name}
            </span>
            <span className="line-clamp-3 w-full break-words text-center text-xs group-hover:line-clamp-none group-focus:line-clamp-none">
                {description}
            </span>
        </Link>
    );
};
