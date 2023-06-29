import { Chatroom } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

async function getJoinedChatrooms(): Promise<Chatroom[]> {
    const controller = new AbortController();

    const response = await fetch("/api/chatroom/get_joined", {
        signal: controller.signal,
    });

    if (!response.ok) {
        console.log("cuko:)");
        throw new Error("cuko:)");
    }

    if (controller.signal.aborted) throw new Error("cuko:)");

    const data: Chatroom[] = await response.json();

    return data;
}

export const useGetAllJoinedChatroomsQuery = () => {
    return useQuery(["chatrooms"], getJoinedChatrooms);
};
