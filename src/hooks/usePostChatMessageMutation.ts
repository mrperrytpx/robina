import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TChatroomData } from "../pages/api/chatroom/[chatId]/get";
import { useSession } from "next-auth/react";
import { TChatroomMessage } from "./useGetChatroomQuery";
import { TChatMessage } from "../lib/zSchemas";
import { randomString } from "../util/randomString";

interface IPostMessage extends TChatMessage {
    chatId: string;
}

export const usePostChatMessageMutation = () => {
    const queryClient = useQueryClient();
    const session = useSession();

    const postMessage = async ({ message, chatId }: IPostMessage) => {
        const body: TChatMessage = {
            message,
        };

        const controller = new AbortController();

        const response = await fetch(`/api/chatroom/${chatId}/message/post`, {
            method: "POST",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        return response;
    };

    return useMutation(postMessage, {
        onMutate: async ({ chatId, message }) => {
            if (!session.data?.user) return;

            await queryClient.cancelQueries(["chatroom", chatId]);
            const previousData: TChatroomData | undefined =
                queryClient.getQueryData(["chatroom", chatId]);

            let msgId = "";

            queryClient.setQueryData(
                ["chatroom", chatId],
                (oldData: TChatroomData | undefined) => {
                    msgId = randomString(10);
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
                        id: msgId,
                    };

                    const newData: TChatroomData = JSON.parse(
                        JSON.stringify(oldData)
                    );
                    newData.messages = [...newData.messages, newMessage];
                    return newData;
                }
            );

            console.log("msgId", msgId);

            return { previousData, msgId, chatId };
        },
        onError: (_err, _player, context) => {
            queryClient.setQueryData(
                ["chatroom", context?.chatId],
                context?.previousData
            );
        },
    });
};
