import { InviteLink } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";

const getInviteLink = async ({ chatId }: { chatId: string }) => {
    const controller = new AbortController();

    const response = await fetch(
        `/api/chatroom/create_invite?chatId=${chatId}`,
        {
            method: "POST",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    const data: InviteLink = await response.json();

    return data;
};

export const useCreateChatroomInviteMutation = () => {
    return useMutation(getInviteLink);
};
