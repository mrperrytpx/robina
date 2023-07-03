import { useMutation } from "@tanstack/react-query";
import { TUsernameFormValues } from "../pages/profile/username";

interface IPostMessage extends TUsernameFormValues {
    chatId: string | string[];
}

export const useUpdateWhitelistMutation = () => {
    const updateWhitelist = async ({ username, chatId }: IPostMessage) => {
        const body: TUsernameFormValues = {
            username,
        };

        const controller = new AbortController();

        const response = await fetch(
            `/api/chatroom/update_whitelist?chatId=${chatId}`,
            {
                method: "PATCH",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
        );

        return response;
    };

    return useMutation(updateWhitelist);
};
