import {
    InfiniteData,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { TChatMessage } from "../lib/zSchemas";
import { TChatroomMessage } from "./useGetChatroomQuery";

export interface IPostMessage extends TChatMessage {
    chatId: string;
    fakeId: string;
}

export const usePostChatMessageMutation = () => {
    const queryClient = useQueryClient();

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
        onError: (_err, variables) => {
            queryClient.setQueryData(
                ["messages", variables.chatId],
                (oldData: InfiniteData<TChatroomMessage[]> | undefined) => {
                    if (!oldData) return { pageParams: [0], pages: [[]] };

                    const newData = oldData.pages.map((page) =>
                        page.map((msg) => {
                            if (msg.id === variables.fakeId) {
                                return { ...msg, error: true };
                            } else {
                                return msg;
                            }
                        })
                    );
                    return {
                        pages: newData,
                        pageParams: oldData.pageParams || [0],
                    };
                }
            );
        },
        retry: 0,
    });
};
