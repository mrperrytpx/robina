import { useRouter } from "next/router";
import { useCreateChatroomInviteMutation } from "../hooks/useCreateChatroomInviteMutation";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useDeleteOwnedChatroomMutation } from "../hooks/useDeleteOwnedChatroomMutation";
import { useEffect } from "react";
import { pusherClient } from "../lib/pusher";
import { TChatroomData } from "../pages/api/chatroom/get_chatroom";
import { useQueryClient } from "@tanstack/react-query";
import { useGetChatroomQuery } from "../hooks/useGetChatroomQuery";
import { useLeaveChatroomMutation } from "../hooks/useLeaveChatroomMutation";

interface IChatroomSettingsProps {
    ownerId: string;
}

export const ChatroomSettings = ({ ownerId }: IChatroomSettingsProps) => {
    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);
    const session = useSession();
    const queryClient = useQueryClient();
    const chatroom = useGetChatroomQuery(chatId);

    const createInvite = useCreateChatroomInviteMutation();

    const deleteChatroom = useDeleteOwnedChatroomMutation();
    const leaveChatroom = useLeaveChatroomMutation();

    const dangerButtonStyles =
        "w-full max-w-[300px] rounded-lg bg-gray-100 p-2 font-semibold text-black shadow-lg hover:bg-red-600 hover:text-gray-100 focus:bg-red-600 focus:text-gray-100 active:bg-red-600 active:text-gray-100";

    const handleDeleteChatroom = async () => {
        const response = await deleteChatroom.mutateAsync({ chatId });

        if (!response.ok) return;

        router.push("/chats");
    };

    const handleLeaveChatroom = async () => {
        const response = await leaveChatroom.mutateAsync({ chatId });

        if (!response.ok) return;

        router.push("/chats");
    };

    return (
        <div className="z-20 flex h-full w-full flex-col items-center justify-center bg-slate-800 px-4">
            {ownerId === session.data?.user.id ? (
                <button
                    onClick={handleDeleteChatroom}
                    className={dangerButtonStyles}
                >
                    Delete Chatroom
                </button>
            ) : (
                <button
                    onClick={handleLeaveChatroom}
                    className={dangerButtonStyles}
                >
                    Leave Chatroom
                </button>
            )}
        </div>
    );
};
