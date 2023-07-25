import { useQuery } from "@tanstack/react-query";

export type TInviteLink = {
    value: string;
};

const getInviteLink = async (chatId: string) => {
    const controller = new AbortController();

    const response = await fetch(`/api/chatroom/${chatId}/invite/get`, {
        signal: controller.signal,
    });

    if (controller.signal.aborted)
        throw new Error("Get chatroom messages req aborted");

    if (!response.ok) {
        throw new Error("Failed to get chatroom messages");
    }

    const data: TInviteLink = await response.json();

    return data;
};

export const useGetChatroomInviteQuery = (chatId: string, isOwner: boolean) => {
    return useQuery({
        queryKey: ["invite", chatId],
        queryFn: () => getInviteLink(chatId),
        enabled: !!chatId && isOwner,
        staleTime: Infinity,
    });
};
