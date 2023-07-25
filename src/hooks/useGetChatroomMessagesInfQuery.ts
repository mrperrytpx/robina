import { useInfiniteQuery } from "@tanstack/react-query";
import { TChatroomMessage } from "./useGetChatroomQuery";

async function getChatroomMessages(chatId: string, pageParam: number) {
    const controller = new AbortController();

    const response = await fetch(
        `/api/chatroom/${chatId}/get_messages?offset=${
            pageParam ? pageParam : 0
        }`,
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

    return data.reverse();
}

export const useGetChatroomMessagesInfQuery = (chatId: string) => {
    return useInfiniteQuery({
        queryKey: ["messages", chatId],
        queryFn: ({ pageParam = 0 }) => getChatroomMessages(chatId, pageParam),
        enabled: !!chatId,
        getPreviousPageParam: (firstPage, pages) => {
            return firstPage.length >= 50 ? pages.flat().length : undefined;
        },
        retry: 1,
    });
};
