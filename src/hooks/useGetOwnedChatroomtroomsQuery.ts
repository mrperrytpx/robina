import { Chatroom } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

async function getOwnedChatroom(): Promise<Chatroom> {
    const response = await fetch("/api/chatroom/get_owned");

    if (!response.ok) {
        console.log(":)");
        throw new Error(":)");
    }

    const data: Chatroom = await response.json();

    return data;
}

export const useGetOwnedChatroomtroomsQuery = () => {
    return useQuery(["owned_chatroom"], getOwnedChatroom);
};
