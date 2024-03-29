import Link from "next/link";
import { VscAdd, VscCheck, VscChromeClose } from "react-icons/vsc";
import { useJoinChatroomMutation } from "../hooks/useJoinChatroomMutation";
import { TChatroomInvite } from "../hooks/useGetUserPendingInvitesQuery";
import { LoadingSpinner } from "./LoadingSpinner";
import { useDeclineCharoomInviteMutation } from "../hooks/useDeclineChatroomInviteMutation";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { pusherClient } from "../lib/pusher";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { TChatroomWithOwner } from "../pages/api/chatroom/get_owned";

interface IInviteChatroomCardProps {
    chatroom: TChatroomInvite;
}

export const InviteChatroomCard = ({ chatroom }: IInviteChatroomCardProps) => {
    const joinChatroom = useJoinChatroomMutation();
    const declineInvite = useDeclineCharoomInviteMutation();

    const handleAcceptInvite = async () => {
        const response = await joinChatroom.mutateAsync({
            invite: chatroom.invite_link.value,
        });

        if (!response.ok) {
            const error = await response.text();
            toast.error(error);
            return;
        }
    };

    const handleDeclineInvite = async () => {
        const { response } = await declineInvite.mutateAsync({
            chatId: chatroom.id,
        });

        if (!response.ok) {
            const error = await response.text();
            toast.error(error);
            return;
        }
    };

    return (
        <div
            tabIndex={0}
            className="group relative flex aspect-video w-[min(100%,17.5rem)] flex-col items-center justify-center gap-4 rounded-xl bg-white p-4 shadow-md outline outline-2 outline-glacier-900 hover:shadow-glacier-600 hover:outline-[3px] hover:outline-glacier-600 focus:shadow-glacier-600 focus:outline-[3px] focus:outline-glacier-600"
        >
            {joinChatroom.isLoading ? (
                <LoadingSpinner size={50} color="#337387" />
            ) : (
                <>
                    <span className="line-clamp-2 w-full break-words text-center text-xl group-hover:line-clamp-none group-hover:hidden group-focus:line-clamp-none group-focus:hidden">
                        <strong className="text-glacier-900">
                            {chatroom.owner.username}&apos;s
                        </strong>{" "}
                        {chatroom.name}
                    </span>
                    <span className="line-clamp-3 w-full break-words text-center text-xs group-hover:line-clamp-none group-hover:hidden group-focus:line-clamp-none group-focus:hidden">
                        {chatroom.description}
                    </span>

                    <div className="invisible absolute inset-0 flex h-full w-full items-center justify-between group-hover:visible group-focus:visible">
                        <button
                            onClick={handleAcceptInvite}
                            disabled={joinChatroom.isLoading}
                            className="group/button mx-auto rounded-full p-1 transition-colors duration-75"
                            aria-label={`Accept invite to a chatroom with the name ${chatroom.name}`}
                        >
                            <VscCheck className="h-20 w-20 fill-glacier-900 group-hover/button:fill-glacier-600 group-focus/button:fill-glacier-600" />
                        </button>
                        <button
                            onClick={handleDeclineInvite}
                            disabled={declineInvite.isLoading}
                            className="group/button mx-auto rounded-full p-1 transition-colors duration-75"
                            aria-label={`Decline invite to a chatroom with the name ${chatroom.name}`}
                        >
                            <VscChromeClose className="h-20 w-20 fill-glacier-900 group-hover/button:fill-red-600 group-focus/button:fill-red-600" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export const LoadingChatroomCard = () => {
    return (
        <div className="group relative grid aspect-video w-[min(100%,17.5rem)] items-center rounded-xl bg-white p-6 shadow-lg outline outline-2 outline-glacier-900">
            <div className="mb-4 h-6 w-full animate-pulse rounded-lg bg-glacier-200" />
            <div className="flex flex-col gap-0.5">
                <div className="h-4 w-full animate-pulse rounded-lg bg-glacier-200" />
                <div className="h-4 w-full animate-pulse rounded-lg bg-glacier-200" />
            </div>
        </div>
    );
};

interface INewChatroomCardProps {
    title: string;
    href: string;
    hrefAs?: string;
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
            className="group relative grid aspect-video w-[min(100%,17.5rem)]  items-center rounded-xl bg-white text-center shadow-md outline outline-2 outline-glacier-900 hover:shadow-glacier-600 hover:outline-[3px] hover:outline-glacier-600 focus:shadow-glacier-600 focus:outline-[3px] focus:outline-glacier-600"
        >
            <span className="group-hover:hidden">{title}</span>
            <div className="absolute inset-0 hidden h-full w-full items-center group-hover:grid">
                <VscAdd className="mx-auto h-20 w-20 fill-glacier-900" />
            </div>
        </Link>
    );
};

interface IEnterChatroomCard {
    chatroom: TChatroomWithOwner;
}

export const EnterChatroomCard = ({ chatroom }: IEnterChatroomCard) => {
    const session = useSession();
    const queryClient = useQueryClient();

    useEffect(() => {
        const deleteRoomHandler = (data: {
            chatId: string;
            userId: string;
        }) => {
            if (data.userId !== session.data?.user.id) {
                queryClient.setQueryData(
                    ["chatrooms", session.data?.user.id],
                    (oldData: TChatroomWithOwner[] | undefined) => {
                        if (!oldData) return;
                        return oldData.filter(
                            (room) => room.id !== data.chatId
                        );
                    }
                );
            }

            [
                "chatroom",
                "invite",
                "banned_members",
                "chat_invites",
                "members",
                "messages",
            ].forEach((query) =>
                queryClient.removeQueries([query, data.chatId])
            );
        };

        pusherClient.subscribe(`chat__${chatroom.id}__delete-room`);
        pusherClient.bind("delete-room", deleteRoomHandler);

        return () => {
            pusherClient.unsubscribe(`chat__${chatroom.id}__delete-room`);
            pusherClient.unbind("delete-room", deleteRoomHandler);
        };
    }, [chatroom.id, queryClient, session.data?.user.id]);

    return (
        <Link
            href={`/chats/${chatroom.id}`}
            aria-label={`Visit a chatroom named ${chatroom.name}`}
            className="group relative flex aspect-video w-[min(100%,17.5rem)] flex-col items-center justify-center gap-4 rounded-xl bg-white p-4 shadow-md outline outline-2 outline-glacier-900 hover:shadow-glacier-600 hover:outline-[3px] hover:outline-glacier-600 focus:shadow-glacier-600 focus:outline-[3px] focus:outline-glacier-600"
        >
            <span className="line-clamp-2 w-full break-words text-center text-xl group-hover:line-clamp-none group-focus:line-clamp-none">
                <strong className="text-glacier-900">
                    {chatroom.owner.username}&apos;s{" "}
                </strong>
                {chatroom.name}
            </span>
            <span className="line-clamp-3 w-full break-words text-center text-xs group-hover:line-clamp-none group-focus:line-clamp-none">
                {chatroom.description}
            </span>
        </Link>
    );
};
