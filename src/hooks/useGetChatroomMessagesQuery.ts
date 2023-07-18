import { useQuery } from "@tanstack/react-query";
import { TChatroomMessage } from "./useGetChatroomQuery";

async function getChatroomMessages(chatId: string) {
    const controller = new AbortController();

    const response = await fetch(`/api/chatroom/${chatId}/get_messages`, {
        signal: controller.signal,
    });

    if (controller.signal.aborted)
        throw new Error("Get chatroom messages req aborted");

    if (!response.ok) {
        throw new Error("Failed to get chatroom messages");
    }

    const data: TChatroomMessage[] = await response.json();

    return data;
}

export const useGetChatroomMessagesQuery = (chatId: string) => {
    return useQuery({
        queryKey: ["messages", chatId],
        queryFn: () => getChatroomMessages(chatId),
        enabled: !!chatId,
    });
};
