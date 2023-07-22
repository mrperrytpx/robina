import { useMutation } from "@tanstack/react-query";
import { TUsernameFormValues } from "../pages/force-username";
import { toast } from "react-toastify";

export const useUpdateUsernameMutation = () => {
    const updateUsername = async ({ username }: TUsernameFormValues) => {
        const body: TUsernameFormValues = {
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

        return response;
    };

    return useMutation(updateUsername, {
        onMutate: (data) => {
            return { ...data };
        },
        onSuccess: async (_data, _vars, context) => {
            toast.success(`Username changed to "${context?.username}"!`);
        },
    });
};
