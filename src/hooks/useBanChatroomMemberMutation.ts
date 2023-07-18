import { User } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface IBanMember {
    memberId: string;
    chatId: string;
}

export const useBanChatroomMemberMutation = () => {
    const queryClient = useQueryClient();

    const banChatroomMember = async ({ memberId, chatId }: IBanMember) => {
        const controller = new AbortController();

        const response = await fetch(
            `/api/chatroom/${chatId}/member/${memberId}/ban`,
            {
                method: "DELETE",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return { chatId, response };
    };

    return useMutation(banChatroomMember, {
        onMutate: async (data) => {
            await queryClient.cancelQueries(["banned_members", data.chatId]);
            const previousData: User[] | undefined = queryClient.getQueryData([
                "banned_members",
                data.chatId,
            ]);

            const chatroomMembers: User[] | undefined =
                queryClient.getQueryData(["members", data.chatId]);

            const member = chatroomMembers?.find(
                (member) => member.id === data.memberId
            );
            if (!member) return;

            queryClient.setQueryData(
                ["banned_members", data.chatId],
                (oldData: typeof previousData) => {
                    if (!oldData) return;
                    return [...oldData, member];
                }
            );

            return { previousData, chatId: data.chatId };
        },
        onError: (_err, _vars, context) => {
            queryClient.setQueryData(
                ["banned_members", context?.chatId],
                context?.previousData
            );
        },
        onSuccess: (data) =>
            queryClient.invalidateQueries(["banned_members", data.chatId]),
    });
};
