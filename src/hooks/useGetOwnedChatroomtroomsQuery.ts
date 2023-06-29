import { Chatroom } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

async function getOwnedChatroom(): Promise<Chatroom> {
    const controller = new AbortController();

    const response = await fetch("/api/chatroom/get_owned", {
        signal: controller.signal,
    });

    if (!response.ok) {
        console.log(":)");
        throw new Error(":)");
    }

    if (controller.signal.aborted) throw new Error(":)");

    const data: Chatroom = await response.json();

    return data;
}

export const useGetOwnedChatroomtroomsQuery = () => {
    return useQuery(["owned_chatroom"], getOwnedChatroom);
};
