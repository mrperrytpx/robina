import { useMutation } from "@tanstack/react-query";
import { UsernameFormValues } from "../pages/profile/username";

export const useUpdateUsernameMutation = () => {
    const updateUsername = async ({ username }: UsernameFormValues) => {
        const body: UsernameFormValues = {
            username,
        };

        const controller = new AbortController();

        const response = await fetch("/api/profile/update_username", {
            method: "PATCH",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.log("Failed to update username");
        }

        if (controller.signal.aborted) console.log("username update aborted");

        return response;
    };

    return useMutation(updateUsername);
};
