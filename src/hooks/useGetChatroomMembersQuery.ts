import { useQuery } from "@tanstack/react-query";
import { User } from "@prisma/client";

async function getChatroomMembers(chatId: string) {
    const controller = new AbortController();

    const response = await fetch(`/api/chatroom/${chatId}/get_members`, {
        signal: controller.signal,
    });

    if (controller.signal.aborted)
        throw new Error("Get chatroom messages req aborted");

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(response.statusText);
        }
        const error = await response.text();
        throw new Error(error);
    }

    const data: User[] = await response.json();

    return data;
}

export const useGetChatroomMembersQuery = (chatId: string) => {
    return useQuery({
        queryKey: ["members", chatId],
        queryFn: () => getChatroomMembers(chatId),
        enabled: !!chatId,
    });
};
