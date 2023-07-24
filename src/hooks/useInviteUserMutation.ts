import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface IInviteUser {
    chatId: string;
    username: string;
}

export const useInviteUserMutation = () => {
    const inviteUser = async ({ chatId, username }: IInviteUser) => {
        const controller = new AbortController();

        const response = await fetch(`/api/chatroom/${chatId}/invite`, {
            method: "POST",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }),
        });

        return response;
    };

    return useMutation(inviteUser, {
        onMutate: (data) => {
            return { ...data };
        },
        onSuccess: (data, _vars, context) => {
            if (!data.ok) return;
            toast.success(`${context?.username} invited!`);
        },
    });
};
