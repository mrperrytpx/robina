import { User } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface IUnbanMember {
    memberId: string;
    chatId: string;
}

export const useUnbanChatroomMemberMutation = () => {
    const queryClient = useQueryClient();

    const unbanChatroomMember = async ({ memberId, chatId }: IUnbanMember) => {
        const controller = new AbortController();

        const response = await fetch(
            `/api/chatroom/${chatId}/member/${memberId}/unban`,
            {
                method: "PATCH",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return { chatId, response };
    };

    return useMutation(unbanChatroomMember, {
        onMutate: async (data) => {
            await queryClient.cancelQueries(["banned_members", data.chatId]);
            const previousData: User[] | undefined = queryClient.getQueryData([
                "banned_members",
                data.chatId,
            ]);

            queryClient.setQueryData(
                ["banned_members", data.chatId],
                (oldData: typeof previousData) => {
                    return oldData?.filter(
                        (member) => member.id !== data.memberId
                    );
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
