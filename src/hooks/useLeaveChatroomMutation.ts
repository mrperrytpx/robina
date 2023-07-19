import { Chatroom } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface ILeaveChatroom {
    chatId: string;
}

export const useLeaveChatroomMutation = () => {
    const queryClient = useQueryClient();
    const session = useSession();

    const leaveChatroom = async ({ chatId }: ILeaveChatroom) => {
        const controller = new AbortController();

        const response = await fetch(`/api/chatroom/${chatId}/leave`, {
            method: "DELETE",
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
            const previousData: Chatroom[] | undefined =
                queryClient.getQueryData(["chatrooms", session.data?.user.id]);
            queryClient.setQueryData(
                ["chatrooms", session.data?.user.id],
                (oldData: Chatroom[] | undefined) => {
                    if (!oldData) return;
                    return oldData.filter(
                        (chatroom) => chatroom.id !== data.chatId
                    );
                }
            );
            return { previousData };
        },
        onError: (_err, _vars, context) => {
            queryClient.setQueryData(
                ["chatrooms", session.data?.user.id],
                context?.previousData
            );
        },
        onSuccess: async (data) => {
            if (!data.response.ok) return;
            queryClient.invalidateQueries(["chatrooms", session.data?.user.id]);
        },
    });
};
