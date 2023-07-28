import { User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

async function getBannedMembers(chatId: string): Promise<User[]> {
    const controller = new AbortController();

    const response = await fetch(`/api/chatroom/${chatId}/get_banned_members`, {
        signal: controller.signal,
    });

    if (controller.signal.aborted)
        throw new Error("Get banned chatroom membners req aborted");

    if (!response.ok) {
        if (response.status === 404 || response.status >= 500) {
            throw new Error(response.statusText);
        }
        const error = await response.text();
        throw new Error(error);
    }

    const data: User[] = await response.json();

    return data;
}

export const useGetBannedChatroomMembersQuery = (
    chatId: string,
    isOwner: boolean
) => {
    return useQuery({
        queryKey: ["banned_members", chatId],
        queryFn: () => getBannedMembers(chatId),
        enabled: !!chatId && isOwner,
    });
};
