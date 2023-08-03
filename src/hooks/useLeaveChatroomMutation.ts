import { Chatroom } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { TChatroomWIthOwner } from "../pages/api/chatroom/get_owned";

interface ILeaveChatroom {
    chatId: string;
}

export const useLeaveChatroomMutation = () => {
    const queryClient = useQueryClient();
    const session = useSession();

    const leaveChatroom = async ({ chatId }: ILeaveChatroom) => {
        const controller = new AbortController();

        const response = await fetch(`/api/chatroom/${chatId}/leave`, {
            method: "PATCH",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
        });

        return { response, chatId };
    };

    return useMutation(leaveChatroom, {
        onMutate: async (data) => {
            await queryClient.cancelQueries([
                "chatrooms",
                session.data?.user.id,
            ]);
            const previousData: TChatroomWIthOwner[] | undefined =
                queryClient.getQueryData(["chatrooms", session.data?.user.id]);

            const chatroom: Chatroom | undefined = queryClient.getQueryData([
                "chatroom",
                data.chatId,
            ]);

            queryClient.setQueryData(
                ["chatrooms", session.data?.user.id],
                (oldData: TChatroomWIthOwner[] | undefined) => {
                    if (!oldData) return;
                    return oldData.filter(
                        (chatroom) => chatroom.id !== data.chatId
                    );
                }
            );
            return { previousData, chatName: chatroom?.name };
        },
        onError: (_err, _vars, context) => {
            queryClient.setQueryData(
                ["chatrooms", session.data?.user.id],
                context?.previousData
            );
        },
        onSuccess: async (data, _vars, context) => {
            if (!data.response.ok) return;
            toast.success(`You left ${context?.chatName}!`);
            queryClient.invalidateQueries(["chatrooms", session.data?.user.id]);
        },
    });
};
