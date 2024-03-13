import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { TChatroomWithOwner } from "../pages/api/chatroom/get_owned";

async function getOwnedChatroom(): Promise<TChatroomWithOwner> {
    const controller = new AbortController();

    const response = await fetch("/api/chatroom/get_owned", {
        signal: controller.signal,
    });

    if (controller.signal.aborted)
        throw new Error("Owned Chatroom fetch aborted");

    if (!response.ok) {
        if (response.status === 404 || response.status >= 500) {
            throw new Error(response.statusText);
        }
        const error = await response.text();
        throw new Error(error);
    }

    const data: TChatroomWithOwner = await response.json();

    return data;
}

export const useGetOwnedChatroomsQuery = () => {
    const session = useSession();

    return useQuery({
        queryKey: ["owned_chatroom", session.data?.user.id],
        queryFn: getOwnedChatroom,
        enabled: !!session.data?.user.id,
    });
};
