import {
    InfiniteData,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { TChatroomMessage } from "./useGetChatroomQuery";
import { TChatMessage } from "../lib/zSchemas";

export interface IPostMessage extends TChatMessage {
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
            const previousData: InfiniteData<TChatroomMessage[]> | undefined =
                queryClient.getQueryData(["messages", chatId]);

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

            queryClient.setQueryData<typeof previousData>(
                ["messages", chatId],
                (oldData) => {
                    const newData: typeof previousData = JSON.parse(
                        JSON.stringify(oldData)
                    );

                    newData?.pages[newData?.pages.length - 1 ?? 0].push(
                        newMessage
                    );

                    return newData;
                }
            );

            return { previousData, fakeId, chatId };
        },
        onError: (_err, _vars, context) => {
            queryClient.setQueryData(
                ["messages", context?.chatId],
                (oldData: InfiniteData<TChatroomMessage[]> | undefined) => {
                    if (!oldData) return;
                    const newData: typeof oldData = JSON.parse(
                        JSON.stringify(oldData)
                    );

                    newData.pages.forEach((page) => {
                        page.filter(
                            (message) => message.id !== context?.fakeId
                        );
                    });

                    return newData;
                }
            );
        },
    });
};
