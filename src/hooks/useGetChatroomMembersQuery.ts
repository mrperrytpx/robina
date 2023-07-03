import { User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

async function getChatroomMembers(chatId: string) {
    const controller = new AbortController();

    const response = await fetch(`/api/chatroom/get_members?chatId=${chatId}`, {
        signal: controller.signal,
    });

    console.log("resp", response);

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
