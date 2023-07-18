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
        onSuccess: (data) =>
            queryClient.invalidateQueries(["banned_members", data.chatId]),
    });
};
