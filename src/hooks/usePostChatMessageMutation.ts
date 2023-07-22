import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { TChatroomMessage } from "./useGetChatroomQuery";
import { TChatMessage } from "../lib/zSchemas";

interface IPostMessage extends TChatMessage {
    chatId: string;
    fakeId: string;
}

export const usePostChatMessageMutation = () => {
    const queryClient = useQueryClient();
    const session = useSession();

    const postMessage = async ({ message, chatId, fakeId }: IPostMessage) => {
        const body: TChatMessage & { fakeId: string } = {
            message,
            fakeId,
        };

        const response = await fetch(`/api/chatroom/${chatId}/message/post`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        return response;
    };

    return useMutation(postMessage, {
        onMutate: async ({ chatId, message, fakeId }) => {
            if (!session.data?.user) return;

            await queryClient.cancelQueries(["messages", chatId]);
            const previousData: TChatroomMessage[] | undefined =
                queryClient.getQueryData(["messages", chatId]);

            queryClient.setQueryData(
                ["messages", chatId],
                (oldData: TChatroomMessage[] | undefined) => {
                    const newMessage: TChatroomMessage = {
                        author: {
                            ...session.data.user,
                            created_at: new Date(),
                            emailVerified: null,
                        },
                        author_id: session.data.user.id,
                        chatroom_id: chatId,
                        content: message,
                        created_at: new Date(),
                        id: fakeId,
                    };
                    if (!oldData) return [newMessage];

                    return [...oldData, newMessage];
                }
            );

            return { previousData, fakeId, chatId };
        },
        onError: (_err, _player, context) => {
            queryClient.setQueryData(
                ["messages", context?.chatId],
                context?.previousData
            );
        },
    });
};
