import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";
import { z } from "zod";

export type TDeleteMessage = z.infer<typeof deleteMessageSchema>;

const deleteMessageSchema = z.object({
    chatId: z.string().min(1),
    messageId: z.string().min(1),
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "DELETE") {
        const { chatId, messageId } = deleteMessageSchema.parse(req.query);

        if (!chatId) return res.status(400).end("Please provide an ID");

        const session = await getServerSession(req, res, authOptions);

        if (!session) return res.status(401).end("No session");

        const user = await prisma.user.findFirst({
            where: {
                id: session.user.id,
            },
        });

        if (!user) return res.status(401).end("No user");

        const message = await prisma.message.findFirst({
            where: {
                id: messageId,
            },
        });

        if (!message) return res.status(404).end("No message found");

        if (message.author_id !== user.id)
            return res.status(401).end("Not your message");

        await prisma.message.delete({
            where: {
                id: message.id,
            },
        });

        res.status(201).end("Success");
    } else {
        res.setHeader("Allow", "DELETE");
        res.status(405).end("Method Not Allowed");
    }
}
