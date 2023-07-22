import { Chatroom } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

interface IDeleteChatroom {
    chatId: string | string[];
}

export const useDeleteOwnedChatroomMutation = () => {
    const queryClient = useQueryClient();
    const session = useSession();

    const deleteOwnedChatroom = async ({ chatId }: IDeleteChatroom) => {
        const controller = new AbortController();

        const response = await fetch(`/api/chatroom/${chatId}/delete`, {
            method: "DELETE",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
        });

        return { response, chatId };
    };

    return useMutation(deleteOwnedChatroom, {
        onMutate: async () => {
            await queryClient.cancelQueries([
                "owned_chatroom",
                session.data?.user.id,
            ]);
            const previousData: Chatroom | undefined = queryClient.getQueryData(
                ["owned_chatroom", session.data?.user.id]
            );
            queryClient.setQueryData(
                ["owned_chatroom", session.data?.user.id],
                null
            );
            return { previousData };
        },
        onError: (_err, _vars, context) => {
            queryClient.setQueryData(
                ["owned_chatroom", session.data?.user.id],
                context?.previousData
            );
        },
        onSuccess: async (data, _vars, context) => {
            if (!data.response.ok) return;
            toast.success(
                `You successfully deleted "${context?.previousData?.name}"!`
            );

            queryClient.invalidateQueries([
                "owned_chatroom",
                session.data?.user.id,
            ]);
        },
    });
};
