import { Chatroom } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

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
            const chatroom: Chatroom = await data.json();
            queryClient.setQueryData(
                ["chatrooms", session.data?.user.id],
                (oldData: Chatroom[] | undefined) => {
                    if (!oldData) return [chatroom];
                    return [...oldData, chatroom];
                }
            );
            queryClient.invalidateQueries(["chatrooms", session.data?.user.id]);
        },
    });
};
