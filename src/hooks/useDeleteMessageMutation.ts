import {
    InfiniteData,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { TDeleteMessage } from "../pages/api/chatroom/[chatId]/message/[messageId]/delete";
import { TPageOfMessages } from "./useGetChatroomMessagesInfQuery";

export const useDeleteMessageMutation = () => {
    const queryClient = useQueryClient();

    const deleteMessage = async ({ messageId, chatId }: TDeleteMessage) => {
        const controller = new AbortController();

        const response = await fetch(
            `/api/chatroom/${chatId}/message/${messageId}/delete`,
            {
                method: "DELETE",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return response;
    };

    return useMutation(deleteMessage, {
        onMutate: async ({ chatId, messageId }) => {
            await queryClient.cancelQueries(["messages", chatId]);
            const previousData: InfiniteData<TPageOfMessages> | undefined =
                queryClient.getQueryData(["messages", chatId]);

            queryClient.setQueryData(
                ["messages", chatId],
                (oldData: typeof previousData) => {
                    if (!oldData) return;

                    const newData = oldData.pages.map((page) => {
                        return {
                            ...page,
                            messages: page.messages.filter(
                                (msg) => msg.id !== messageId
                            ),
                        };
                    });

                    return { pages: newData, pageParams: oldData.pageParams };
                }
            );

            return { previousData, chatId };
        },
        onError: (_error, _vars, context) =>
            queryClient.setQueryData(
                ["messages", context?.chatId],
                context?.previousData
            ),
    });
};
