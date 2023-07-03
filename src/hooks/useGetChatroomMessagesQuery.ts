import { Message } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

type TChatId = string;

export type TChatroomMessage = Message & {
    author: {
        username: string;
        image: string;
    };
};

async function getChatroomMessages(chatId: TChatId) {
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

    const data: TChatroomMessage[] = await response.json();

    return data;
}

export const useGetChatroomMessagesQuery = (chatId: TChatId) => {
    return useQuery({
        queryKey: ["messages", chatId],
        queryFn: () => getChatroomMessages(chatId),
        enabled: !!chatId,
    });
};
