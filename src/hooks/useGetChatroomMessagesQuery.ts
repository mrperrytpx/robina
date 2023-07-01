import { Message } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

type ChatId = string;

async function getChatroomMessages(chatId: ChatId): Promise<Message[]> {
    const controller = new AbortController();

    const response = await fetch(
        `/api/chatroom/get_messages?chatId=${chatId}`,
        {
            signal: controller.signal,
        }
    );

    if (controller.signal.aborted)
        throw new Error("Get chatroom messages req aborted");

    if (!response.ok) {
        throw new Error("Failed to get chatroom messages");
    }

    const data: Message[] = await response.json();

    return data;
}

export const useGetChatroomMessagesQuery = (chatId: ChatId) => {
    return useQuery({
        queryKey: ["messages", chatId],
        queryFn: () => getChatroomMessages(chatId),
        enabled: !!chatId,
    });
};
