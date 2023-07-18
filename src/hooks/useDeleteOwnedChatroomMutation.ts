import { useMutation } from "@tanstack/react-query";

interface IDeleteChatroom {
    chatId: string | string[];
}

export const useDeleteOwnedChatroomMutation = () => {
    const deleteOwnedChatroom = async ({ chatId }: IDeleteChatroom) => {
        const controller = new AbortController();

        const response = await fetch(`/api/chatroom/${chatId}/delete`, {
            method: "DELETE",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
        });

        return response;
    };

    return useMutation(deleteOwnedChatroom);
};
