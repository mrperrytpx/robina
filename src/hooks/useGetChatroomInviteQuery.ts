import { useQuery } from "@tanstack/react-query";

export type TInviteLink = {
    value: string;
};

const getInviteLink = async (chatId: string) => {
    const controller = new AbortController();

    const response = await fetch(`/api/chatroom/get_invite?chatId=${chatId}`, {
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

export const useGetChatroomInviteQuery = (chatId: string) => {
    return useQuery({
        queryKey: ["invite", chatId],
        queryFn: () => getInviteLink(chatId),
        enabled: !!chatId,
        staleTime: Infinity,
    });
};
