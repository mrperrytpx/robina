import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TDeleteMessage } from "../pages/api/chatroom/[chatId]/message/[messageId]/delete";
import { TChatroomData } from "../pages/api/chatroom/[chatId]/get";

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
            await queryClient.cancelQueries(["chatroom", chatId]);
            const previousData: TChatroomData | undefined =
                queryClient.getQueryData(["chatroom", chatId]);

            queryClient.setQueryData(
                ["chatroom", chatId],
                (oldData: typeof previousData) => {
                    const newData: TChatroomData = JSON.parse(
                        JSON.stringify(oldData)
                    );

                    newData.messages = newData.messages.filter(
                        (msg) => msg.id !== messageId
                    );
                    return newData;
                }
            );

            return { previousData, chatId };
        },
        onError: (_error, _vars, context) =>
            queryClient.setQueryData(
                ["chatroom", context?.chatId],
                context?.previousData
            ),
    });
};
