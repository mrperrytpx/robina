import { Chatroom } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

async function getOwnedChatroom(): Promise<Chatroom> {
    const controller = new AbortController();

    const response = await fetch("/api/chatroom/get_owned", {
        signal: controller.signal,
    });

    if (!response.ok) {
        throw new Error("You don't own a chatroom");
    }

    if (controller.signal.aborted)
        throw new Error("Owned Chatroom fetch aborted");

    const data: Chatroom = await response.json();

    return data;
}

export const useGetOwnedChatroomtroomsQuery = () => {
    return useQuery({
        queryKey: ["owned_chatroom"],
        queryFn: getOwnedChatroom,
    });
};
