import { z } from "zod";

export type TChatMessage = z.infer<typeof chatMessageSchema>;

export const chatMessageSchema = z.object({
    message: z
        .string()
        .min(1, "Message cannot be empty")
        .max(150, "Message cannot exceed 150 characters"),
});
