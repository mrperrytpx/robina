import { Chatroom, InviteLink } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export type TChatroomInvite = Chatroom & { invite_link: InviteLink };
export type TChatroomInvites = TChatroomInvite[];

async function getPendingInvites() {
    const controller = new AbortController();

    const response = await fetch(`/api/profile/get_pending_invites`, {
        signal: controller.signal,
    });

    if (controller.signal.aborted)
        throw new Error("Get chatroom messages req aborted");

    if (!response.ok) {
        throw new Error("Failed to get chatroom messages");
    }

    const data: (Chatroom & { invite_link: InviteLink })[] =
        await response.json();

    return data.reverse();
}

export const useGetChatroomPendingInvitesQuery = () => {
    const session = useSession();

    return useQuery({
        queryKey: ["invites", session.data?.user.id],
        queryFn: getPendingInvites,
        enabled: !!session.data?.user.id,
    });
};
