import { User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

async function getPendingInvites(chatId: string) {
    const controller = new AbortController();

    const response = await fetch(`/api/chatroom/${chatId}/get_invites`, {
        signal: controller.signal,
    });

    if (controller.signal.aborted)
        throw new Error("Get chatroom messages req aborted");

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

export const useGetChatroomPendingInvites = (chatId: string) => {
    return useQuery({
        queryKey: ["chat_invites", chatId],
        queryFn: () => getPendingInvites(chatId),
        enabled: !!chatId,
    });
};
