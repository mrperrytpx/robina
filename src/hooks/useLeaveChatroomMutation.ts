import { useMutation } from "@tanstack/react-query";

interface ILeaveChatroom {
    chatId: string;
}

export const useLeaveChatroomMutation = () => {
    const leaveChatroom = async ({ chatId }: ILeaveChatroom) => {
        const controller = new AbortController();

        const response = await fetch(`/api/chatroom/${chatId}/leave`, {
            method: "DELETE",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
        });

        return response;
    };

    return useMutation(leaveChatroom);
};
