import { useMutation } from "@tanstack/react-query";

interface IDeleteMember {
    memberId: string;
    chatId: string;
}

export const useDeleteChatroomMemberMutation = () => {
    const deleteChatroomMember = async ({
        memberId,
        chatId,
    }: IDeleteMember) => {
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

    return useMutation(deleteChatroomMember);
};
