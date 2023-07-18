import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../../../../../prisma/prisma";
import { pusherServer } from "../../../../../../lib/pusher";
import { authOptions } from "../../../../auth/[...nextauth]";
import { Message } from "@prisma/client";

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
            include: {
                chatroom: {
                    include: {
                        owner: true,
                    },
                },
            },
        });

        if (!message) return res.status(404).end("No message found");

        if (
            message.author_id !== user.id &&
            user.id !== message.chatroom.owner_id
        )
            return res.status(401).end("Now allowed to delete that message");

        await prisma.message.delete({
            where: {
                id: message.id,
            },
        });

        await pusherServer.trigger(
            `chat__${chatId}__delete-message`,
            "delete-message",
            {
                id: message.id,
                remover_id: user.id,
            }
        );

        res.status(204).end("Success");
    } else {
        res.setHeader("Allow", "DELETE");
        res.status(405).end("Method Not Allowed");
    }
}
