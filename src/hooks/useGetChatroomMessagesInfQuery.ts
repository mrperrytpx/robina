import { useInfiniteQuery } from "@tanstack/react-query";
import { TChatroomMessage } from "./useGetChatroomQuery";

export type TPageOfMessages = {
    hasMore: boolean;
    messages: TChatroomMessage[];
};

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
        if (response.status === 404 || response.status >= 500) {
            throw new Error(response.statusText);
        }
        const error = await response.text();
        throw new Error(error);
    }

    const data: TPageOfMessages = await response.json();

    return data;
}

export const useGetChatroomMessagesInfQuery = (chatId: string) => {
    return useInfiniteQuery({
        queryKey: ["messages", chatId],
        queryFn: ({ pageParam = 0 }) => getChatroomMessages(chatId, pageParam),
        enabled: !!chatId,
        getPreviousPageParam: (firstPage, pages) => {
            const totalMessages = pages.reduce((accumulator, currentPage) => {
                return accumulator + currentPage.messages.length;
            }, 0);

            return firstPage.hasMore ? totalMessages : undefined;
        },
        retry: 1,
    });
};
