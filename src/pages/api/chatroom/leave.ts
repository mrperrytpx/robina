import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../../prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";
import { pusherServer } from "../../../lib/pusher";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "DELETE") {
        const chatId = z.string().parse(req.query.chatId);

        if (!chatId) return res.status(404).end("Provide both a chatId");

        const session = await getServerSession(req, res, authOptions);

        if (!session) return res.status(401).end("No session");

        const user = await prisma.user.findFirst({
            where: {
                id: session.user.id,
            },
            include: {
                chatrooms: true,
                messages: true,
            },
        });

        if (!user) return res.status(401).end("No user");

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                chatrooms: {
                    set: user.chatrooms.filter((chat) => chat.id !== chatId),
                },
            },
        });

        await prisma.message.deleteMany({
            where: {
                id: {
                    in: user.messages
                        .filter((msg) => msg.chatroom_id === chatId)
                        .map((msg) => msg.id),
                },
            },
        });

        await pusherServer.trigger(
            `chat__${chatId}__member-leave`,
            "member-leave",
            {
                id: user.id,
            }
        );

        res.status(204).end();
    } else {
        res.setHeader("Allow", "DELETE");
        res.status(405).end("Method Not Allowed");
    }
}