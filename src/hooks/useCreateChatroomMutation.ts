import { useMutation } from "@tanstack/react-query";
import { TCreateChatroomFormValues } from "../pages/chats/create";

export const useCreateChatroomMutation = () => {
    const createChatroom = async ({
        name,
        description,
        isPublic,
    }: TCreateChatroomFormValues) => {
        const body: TCreateChatroomFormValues = {
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
