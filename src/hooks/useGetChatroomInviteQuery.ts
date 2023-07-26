import { useQuery } from "@tanstack/react-query";

export type TInviteLink = {
    value: string;
};

const getInviteLink = async (chatId: string) => {
    const controller = new AbortController();

    const response = await fetch(`/api/chatroosm/${chatId}/invite/get`, {
        signal: controller.signal,
    });

    if (controller.signal.aborted) {
        throw new Error("Fetch aborted");
    }

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(response.statusText);
        }
        const error = await response.text();
        throw new Error(error);
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
