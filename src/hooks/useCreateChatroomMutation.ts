import { useMutation } from "@tanstack/react-query";
import { FormValues } from "../pages/chats/create";

export const useCreateChatroomMutation = () => {
    const createChatroom = async ({
        name,
        description,
        isPublic,
    }: FormValues) => {
        const body: FormValues = {
            name,
            description,
            isPublic,
        };

        console.log("BODY", body);

        const controller = new AbortController();

        const response = await fetch("/api/chatroom/create", {
            method: "POST",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.log("Failed to create chatroom");
        }

        if (controller.signal.aborted) console.log("mut:)");

        return response;
    };

    return useMutation(createChatroom);
};
