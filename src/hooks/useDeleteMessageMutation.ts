import { useMutation } from "@tanstack/react-query";
import { TDeleteMessage } from "../pages/api/chatroom/[chatId]/message/[messageId]/delete";

export const useDeleteMessageMutation = () => {
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

    return useMutation(deleteMessage);
};
