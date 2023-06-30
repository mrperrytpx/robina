import { useMutation } from "@tanstack/react-query";

export const useDeleteProfileMutation = () => {
    const deleteProfile = async () => {
        const controller = new AbortController();

        const response = await fetch(`/api/profile/delete`, {
            method: "DELETE",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.log("Failed to delete chatroom");
        }

        if (controller.signal.aborted) console.log("mut:)");

        return response;
    };

    return useMutation(deleteProfile);
};
