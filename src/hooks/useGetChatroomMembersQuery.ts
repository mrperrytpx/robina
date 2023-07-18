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
        throw new Error("Failed to get chatroom messages");
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
