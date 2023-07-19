import { Chatroom } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

async function getOwnedChatroom(): Promise<Chatroom> {
    const controller = new AbortController();

    const response = await fetch("/api/chatroom/get_owned", {
        signal: controller.signal,
    });

    if (controller.signal.aborted)
        throw new Error("Owned Chatroom fetch aborted");

    if (!response.ok) {
        throw new Error("Failed to fetch owned chatroom");
    }

    const data: Chatroom = await response.json();

    return data;
}

export const useGetOwnedChatroomtroomsQuery = () => {
    const session = useSession();

    return useQuery({
        queryKey: ["owned_chatroom", session.data?.user.id],
        queryFn: getOwnedChatroom,
        enabled: !!session.data?.user.id,
    });
};
