import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { TChatroomInvites } from "./useGetUserPendingInvitesQuery";
import { toast } from "react-toastify";

interface IDeclineInvite {
    chatId: string;
}

export const useDeclineCharoomInviteMutation = () => {
    const queryClient = useQueryClient();
    const session = useSession();

    const declineInvite = async ({ chatId }: IDeclineInvite) => {
        const controller = new AbortController();

        const response = await fetch(`/api/chatroom/${chatId}/decline_invite`, {
            method: "DELETE",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
        });

        return { response, chatId };
    };

    return useMutation(declineInvite, {
        onMutate: async (data) => {
            await queryClient.cancelQueries(["invites", session.data?.user.id]);
            const previousData: TChatroomInvites | undefined =
                queryClient.getQueryData(["invites", session.data?.user.id]);

            queryClient.setQueryData(
                ["invites", session.data?.user.id],
                (oldData: typeof previousData) => {
                    if (!oldData) return;
                    return oldData.filter(
                        (chatroom) => chatroom.id !== data.chatId
                    );
                }
            );

            toast.success("Chatroom invite declined!");

            return { previousData };
        },
        onError: (_err, _vars_, context) => {
            queryClient.setQueryData(
                ["invites", session.data?.user.id],
                context?.previousData
            );
        },
    });
};
