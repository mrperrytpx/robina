import { useQuery } from "@tanstack/react-query";
import { Chatroom, Message, User } from "@prisma/client";

export type TChatroomMessage = Message & {
    author: User;
    error?: boolean;
};

async function getChatroom(chatId: string) {
    const controller = new AbortController();

    const response = await fetch(`/api/chatroom/${chatId}/get`, {
        signal: controller.signal,
    });

    if (controller.signal.aborted)
        throw new Error("Get chatroom messages req aborted");

    if (!response.ok) {
        if (response.status === 404 || response.status >= 500) {
            throw new Error(response.statusText);
        }
        const error = await response.text();
        throw new Error(error);
    }

    const data: Chatroom = await response.json();

    return data;
}

export const useGetChatroomQuery = (chatId: string) => {
    return useQuery({
        queryKey: ["chatroom", chatId],
        queryFn: () => getChatroom(chatId),
        enabled: !!chatId,
        refetchInterval: 300000,
    });
};
