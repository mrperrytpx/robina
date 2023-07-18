import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TChatroomData } from "../pages/api/chatroom/[chatId]/get";
import { useSession } from "next-auth/react";
import { TChatroomMessage } from "./useGetChatroomQuery";
import { TChatMessage } from "../lib/zSchemas";
import { randomString } from "../util/randomString";

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

            await queryClient.cancelQueries(["chatroom", chatId]);
            const previousData: TChatroomData | undefined =
                queryClient.getQueryData(["chatroom", chatId]);

            queryClient.setQueryData(
                ["chatroom", chatId],
                (oldData: TChatroomData | undefined) => {
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

                    const newData: TChatroomData = JSON.parse(
                        JSON.stringify(oldData)
                    );
                    newData.messages = [...newData.messages, newMessage];
                    return newData;
                }
            );

            return { previousData, fakeId, chatId };
        },
        onError: (_err, _player, context) => {
            queryClient.setQueryData(
                ["chatroom", context?.chatId],
                context?.previousData
            );
        },
    });
};
