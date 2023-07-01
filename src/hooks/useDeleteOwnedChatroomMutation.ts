import { useMutation } from "@tanstack/react-query";

interface IDeleteChatroom {
    id: string | string[];
}

export const useDeleteOwnedChatroomMutation = () => {
    const deleteOwnedChatroom = async ({ id }: IDeleteChatroom) => {
        const controller = new AbortController();

        const response = await fetch(`/api/chatroom/delete_owned?id=${id}`, {
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
