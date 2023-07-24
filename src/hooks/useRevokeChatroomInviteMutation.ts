import { User } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface IRevokeInvite {
    chatId: string;
    memberId: string;
}

export const useRevokeChatroomInviteMutation = () => {
    const queryClient = useQueryClient();

    const revokeInvite = async ({ chatId, memberId }: IRevokeInvite) => {
        const controller = new AbortController();

        const response = await fetch(
            `/api/chatroom/${chatId}/member/${memberId}/revoke_invite`,
            {
                method: "DELETE",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return response;
    };

    return useMutation(revokeInvite, {
        onMutate: (data) => {
            const previousData: User[] | undefined = queryClient.getQueryData([
                "chat_invites",
                data.chatId,
            ]);

            queryClient.setQueryData(
                ["chat_invites", data.chatId],
                (oldData: typeof previousData) => {
                    if (!oldData) return;
                    return oldData.filter(
                        (member) => member.id !== data.memberId
                    );
                }
            );

            return { previousData, chatId: data.chatId };
        },
        onError: (_err, _vars, context) => {
            queryClient.setQueryData(
                ["chat_invites", context?.chatId],
                context?.previousData
            );
        },
    });
};
