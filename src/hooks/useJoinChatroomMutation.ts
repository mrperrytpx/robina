import { Chatroom } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { TChatroomInvite } from "./useGetUserPendingInvitesQuery";
import { TChatroomWIthOwner } from "../pages/api/chatroom/get_owned";

export const useJoinChatroomMutation = () => {
    const queryClient = useQueryClient();
    const session = useSession();

    const joinChatroom = async ({ invite }: { invite: string }) => {
        const body = {
            inviteLink: invite,
        };

        const controller = new AbortController();

        const response = await fetch(`/api/chatroom/join`, {
            method: "POST",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        return response;
    };

    return useMutation(joinChatroom, {
        onSuccess: async (data) => {
            if (!data.ok) return;
            const chatroom: TChatroomInvite = await data.json();
            queryClient.setQueryData(
                ["chatrooms", session.data?.user.id],
                (oldData: TChatroomWIthOwner[] | undefined) => {
                    if (!oldData) return [chatroom];
                    return [chatroom, ...oldData];
                }
            );
            queryClient.setQueryData(
                ["invites", session.data?.user.id],
                (oldData: TChatroomInvite[] | undefined) => {
                    if (!oldData) return;
                    return oldData.filter((room) => room.id !== chatroom.id);
                }
            );
            toast.success(`You joined "${chatroom.name}"!`);
            queryClient.invalidateQueries(["chatrooms", session.data?.user.id]);
        },
    });
};
