import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TInviteLink } from "./useGetChatroomInviteQuery";

interface IPatchInvite {
    chatId: string;
}

export const usePatchChatroomInviteMutation = () => {
    const queryClient = useQueryClient();

    const patchInvite = async ({ chatId }: IPatchInvite) => {
        const controller = new AbortController();

        const response = await fetch(`/api/chatroom/${chatId}/invite/update`, {
            method: "PATCH",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (controller.signal.aborted)
            throw new Error("patch chatroom invite req aborted");

        return { chatId, response };
    };

    return useMutation(patchInvite, {
        onSuccess: async (data) => {
            if (!data.response.ok) return;

            const inviteLink: TInviteLink = await data.response.json();

            queryClient.setQueryData(["invite", data.chatId], {
                value: inviteLink.value,
            });
        },
    });
};
