import { useMutation } from "@tanstack/react-query";
import { CreateChatroomFormValues } from "../pages/chats/create";

export const useCreateChatroomMutation = () => {
    const createChatroom = async ({
        name,
        description,
        isPublic,
    }: CreateChatroomFormValues) => {
        const body: CreateChatroomFormValues = {
            name,
            description,
            isPublic,
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

    return useMutation(createChatroom);
};
