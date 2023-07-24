import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../../../prisma/prisma";
import { authOptions } from "../../auth/[...nextauth]";
import { pusherServer } from "../../../../lib/pusher";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "DELETE") {
        const chatId = z.string().parse(req.query.chatId);

        if (!chatId) return res.status(400).end("Please provide an ID");

        const session = await getServerSession(req, res, authOptions);

        if (!session) return res.status(401).end("No session");

        const user = await prisma.user.findFirst({
            where: {
                id: session.user.id,
            },
            include: {
                owned_chatroom: true,
            },
        });
        if (!user) return res.status(401).end("No user");

        await prisma.chatroom.update({
            where: {
                id: chatId,
            },
            data: {
                invited_members: {
                    disconnect: {
                        id: user.id,
                    },
                },
            },
        });

        await pusherServer.trigger(
            `chat__${chatId}__decline-invite`,
            "decline-invite",
            {
                chatId,
                userId: user.id,
            }
        );

        res.status(204).end("Success");
    } else {
        res.setHeader("Allow", "DELETE");
        res.status(405).end("Method Not Allowed");
    }
}
