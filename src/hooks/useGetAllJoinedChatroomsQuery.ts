import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { TChatroomWIthOwner } from "../pages/api/chatroom/get_owned";

async function getJoinedChatrooms(): Promise<TChatroomWIthOwner[]> {
    const controller = new AbortController();

    const response = await fetch("/api/chatroom/get_joined", {
        signal: controller.signal,
    });

    if (controller.signal.aborted)
        throw new Error("Get joined chatrooms req aborted");

    if (!response.ok) {
        throw new Error("Failed to get joined chatrooms");
    }

    const data: TChatroomWIthOwner[] = await response.json();

    return data;
}

export const useGetAllJoinedChatroomsQuery = () => {
    const session = useSession();

    return useQuery({
        queryKey: ["chatrooms", session.data?.user.id],
        queryFn: getJoinedChatrooms,
        select: (data) =>
            data.filter((room) => room.owner_id !== session.data?.user.id),
        enabled: !!session.data?.user.id,
    });
};
