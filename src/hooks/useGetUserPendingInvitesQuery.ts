import { Chatroom, InviteLink, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export type TChatroomInvite = Chatroom & {
    invite_link: InviteLink;
    owner: User;
};

async function getPendingInvites() {
    const controller = new AbortController();

    const response = await fetch(`/api/profile/get_pending_invites`, {
        signal: controller.signal,
    });

    if (controller.signal.aborted)
        throw new Error("Get chatroom messages req aborted");

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(response.statusText);
        }
        const error = await response.text();
        throw new Error(error);
    }

    const data: TChatroomInvite[] = await response.json();

    return data;
}

export const useGetUserPendingInvitesQuery = () => {
    const session = useSession();

    return useQuery({
        queryKey: ["invites", session.data?.user.id],
        queryFn: getPendingInvites,
        enabled: !!session.data?.user.id,
    });
};
