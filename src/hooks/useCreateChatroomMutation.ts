import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TCreateChatroomFormValues } from "../pages/chats/create";
import { useSession } from "next-auth/react";
import { TChatroomWIthOwner } from "../pages/api/chatroom/get_owned";

export const useCreateChatroomMutation = () => {
    const queryClient = useQueryClient();
    const session = useSession();

    const createChatroom = async ({
        name,
        description,
    }: TCreateChatroomFormValues) => {
        const body: TCreateChatroomFormValues = {
            name,
            description,
        };

        const controller = new AbortController();

        const response = await fetch("/api/chatroom/create", {
            method: "POST",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        return response;
    };

    return useMutation(createChatroom, {
        onSuccess: async (data) => {
            if (!data.ok) return;
            const chatroom: TChatroomWIthOwner = await data.json();
            queryClient.setQueryData(
                ["owned_chatroom", session.data?.user.id],
                chatroom
            );
            queryClient.invalidateQueries([
                "owned_chatroom",
                session.data?.user.id,
            ]);
        },
    });
};
