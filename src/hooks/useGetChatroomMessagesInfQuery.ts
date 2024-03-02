import { useInfiniteQuery } from "@tanstack/react-query";
import { TChatroomMessage } from "./useGetChatroomQuery";

const MESSAGES_OFFSET = 50;

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

    const data: TChatroomMessage[] = await response.json();

    return data.reverse();
}

export const useGetChatroomMessagesInfQuery = (chatId: string) => {
    return useInfiniteQuery({
        queryKey: ["messages", chatId],
        queryFn: ({ pageParam = 0 }) => getChatroomMessages(chatId, pageParam),
        enabled: !!chatId,
        getPreviousPageParam: (_firstPage, pages) => {
            if (pages.flat().length === 0) return undefined;

            if (pages.flat().length >= 50 && pages[0].length !== 0)
                return pages.flat().length;

            return undefined;
        },
        retry: 1,
    });
};
