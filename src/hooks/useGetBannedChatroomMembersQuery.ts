import { User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

async function getBannedMembers(chatId: string): Promise<User[]> {
    const controller = new AbortController();

    const response = await fetch(`/api/chatroom/get_banned?chatId=${chatId}`, {
        signal: controller.signal,
    });

    if (controller.signal.aborted)
        throw new Error("Get banned chatroom membners req aborted");

    if (!response.ok) {
        throw new Error("Failed to get banned chatroom members");
    }

    const data: User[] = await response.json();

    return data;
}

export const useGetBannedChatroomMembersQuery = (chatId: string) => {
    return useQuery({
        queryKey: ["banned_members", chatId],
        queryFn: () => getBannedMembers(chatId),
        enabled: !!chatId,
    });
};
