import { useQuery } from "@tanstack/react-query";
import { TChatroomData } from "../pages/api/chatroom/get_chatroom";
import { Message, User } from "@prisma/client";

export type TChatroomMessage = Message & {
    author: User;
};

async function getChatroom(chatId: string) {
    const controller = new AbortController();

    const response = await fetch(
        `/api/chatroom/get_chatroom?chatId=${chatId}`,
        {
            signal: controller.signal,
        }
    );

    if (controller.signal.aborted)
        throw new Error("Get chatroom messages req aborted");

    if (!response.ok) {
        throw new Error("Failed to get chatroom messages");
    }

    const data: TChatroomData = await response.json();

    return data;
}

export const useGetChatroomQuery = (chatId: string) => {
    return useQuery({
        queryKey: ["chatroom", chatId],
        queryFn: () => getChatroom(chatId),
        enabled: !!chatId,
    });
};
