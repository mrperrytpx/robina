import { useMutation } from "@tanstack/react-query";
import { TChatMessage } from "../lib/zSchemas";

export interface IPostMessage extends TChatMessage {
    chatId: string;
    fakeId: string;
}

export const usePostChatMessageMutation = () => {
    const postMessage = async ({ message, chatId, fakeId }: IPostMessage) => {
        const body: TChatMessage & { fakeId: string } = {
            message,
            fakeId,
        };

        const response = await fetch(`/api/chatroom/${chatId}/message/post`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        return response;
    };

    return useMutation(postMessage);
};
