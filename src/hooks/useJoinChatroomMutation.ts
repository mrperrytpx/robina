import { useMutation } from "@tanstack/react-query";

export const useJoinChatroomMutation = () => {
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

    return useMutation(joinChatroom);
};
