import { useMutation } from "@tanstack/react-query";

interface IBanMember {
    memberId: string;
    chatId: string;
}

export const useBanChatroomMemberMutation = () => {
    const banChatroomMember = async ({ memberId, chatId }: IBanMember) => {
        const controller = new AbortController();

        const response = await fetch(
            `/api/chatroom/delete_member?chatId=${chatId}&memberId=${memberId}`,
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

    return useMutation(banChatroomMember);
};
