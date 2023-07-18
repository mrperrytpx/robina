import { useMutation } from "@tanstack/react-query";
import { TChatMessage } from "../lib/zSchemas";

interface IPostMessage extends TChatMessage {
    chatId: string | string[];
}

export const usePostChatMessageMutation = () => {
    const postMessage = async ({ message, chatId }: IPostMessage) => {
        const body: TChatMessage = {
            message,
        };

        const controller = new AbortController();

        const response = await fetch(`/api/chatroom/${chatId}/message/post`, {
            method: "POST",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        return response;
    };

    return useMutation(postMessage);
};
