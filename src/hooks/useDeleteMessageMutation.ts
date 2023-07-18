import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TDeleteMessage } from "../pages/api/chatroom/[chatId]/message/[messageId]/delete";
import { TChatroomMessage } from "./useGetChatroomQuery";

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
            const previousData: TChatroomMessage[] | undefined =
                queryClient.getQueryData(["messages", chatId]);

            queryClient.setQueryData(
                ["messages", chatId],
                (oldData: typeof previousData) => {
                    let newData: TChatroomMessage[] = JSON.parse(
                        JSON.stringify(oldData)
                    );

                    newData = newData.filter((msg) => msg.id !== messageId);
                    return newData;
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
