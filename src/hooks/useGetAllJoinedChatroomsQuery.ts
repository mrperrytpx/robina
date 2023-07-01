import { Chatroom } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

async function getJoinedChatrooms(): Promise<Chatroom[]> {
    const controller = new AbortController();

    const response = await fetch("/api/chatroom/get_joined", {
        signal: controller.signal,
    });

    if (controller.signal.aborted)
        throw new Error("Get joined chatrooms req aborted");

    if (!response.ok) {
        throw new Error("Failed to get joined chatrooms");
    }

    const data: Chatroom[] = await response.json();

    return data;
}

export const useGetAllJoinedChatroomsQuery = () => {
    const session = useSession();

    return useQuery({
        queryKey: ["chatrooms"],
        queryFn: getJoinedChatrooms,
        select: (data) =>
            data.filter((room) => room.owner_id !== session.data?.user.id),
    });
};
