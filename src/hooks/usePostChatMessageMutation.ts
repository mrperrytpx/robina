import { useMutation } from "@tanstack/react-query";
import { ChatMessage } from "../pages/chats/[chatId]";

interface IPostMessage extends ChatMessage {
    chatId: string | string[];
}

export const usePostChatMessageMutation = () => {
    const postMessage = async ({ message, chatId }: IPostMessage) => {
        const body: ChatMessage = {
            message,
        };

        const controller = new AbortController();

        const response = await fetch(
            `/api/chatroom/post_message?chatId=${chatId}`,
            {
                method: "POST",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
        );

        return response;
    };

    return useMutation(postMessage);
};
