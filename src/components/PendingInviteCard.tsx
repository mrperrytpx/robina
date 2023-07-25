import React from "react";
import { TChatroomInvite } from "../hooks/useGetUserPendingInvitesQuery";
import { VscCheck, VscChromeClose } from "react-icons/vsc";
import { toast } from "react-toastify";
import { useDeclineCharoomInviteMutation } from "../hooks/useDeclineChatroomInviteMutation";
import { useJoinChatroomMutation } from "../hooks/useJoinChatroomMutation";
import { LoadingSpinner } from "./LoadingSpinner";

interface IPendingInviteCardProps {
    chatroom: TChatroomInvite;
}

export const PendingInviteCard = ({ chatroom }: IPendingInviteCardProps) => {
    const joinChatroom = useJoinChatroomMutation();
    const declineInvite = useDeclineCharoomInviteMutation();

    const handleAcceptInvite = async (invite: string) => {
        const response = await joinChatroom.mutateAsync({
            invite,
        });

        if (!response.ok) {
            const error = await response.text();
            toast.error(error);
            return;
        }
    };

    const handleDeclineInvite = async (id: string) => {
        const { response } = await declineInvite.mutateAsync({
            chatId: id,
        });

        if (!response.ok) {
            const error = await response.text();
            toast.error(error);
            return;
        }
    };

    return (
        <div
            key={chatroom.id}
            className="my-1 flex w-full max-w-md items-center justify-between rounded-md border-2 border-black p-2 text-sm font-medium hover:border-sky-500"
        >
            <span className="truncate">
                <strong>
                    {chatroom.owner.username}
                    &apos;s
                </strong>{" "}
                {chatroom.name}
            </span>
            <div className="flex items-center gap-4">
                <button
                    onClick={() =>
                        handleAcceptInvite(chatroom.invite_link.value)
                    }
                    disabled={joinChatroom.isLoading}
                    className="group/button rounded-full"
                >
                    {joinChatroom.isLoading ? (
                        <LoadingSpinner size={20} color="#0ea5e9" />
                    ) : (
                        <VscCheck
                            className="fill-black group-hover/button:fill-sky-500 group-focus/button:fill-sky-500"
                            size={20}
                        />
                    )}
                </button>
                <button
                    onClick={() => handleDeclineInvite(chatroom.id)}
                    disabled={declineInvite.isLoading}
                    className="group/button rounded-full"
                >
                    <VscChromeClose
                        className="fill-black group-hover/button:fill-red-600 group-focus/button:fill-red-600"
                        size={20}
                    />
                </button>
            </div>
        </div>
    );
};
