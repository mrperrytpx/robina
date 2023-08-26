import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../../../prisma/prisma";
import { pusherServer } from "../../../../lib/pusher";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method === "PATCH") {
            const chatId = z.string().parse(req.query.chatId);

            if (!chatId) return res.status(400).end("Provide a valid chat ID!");

            const session = await getServerSession(req, res, authOptions);

            if (!session) return res.status(401).end("No session!");

            const user = await prisma.user.findFirst({
                where: {
                    id: session.user.id,
                },
                include: {
                    chatrooms: true,
                    messages: true,
                    owned_chatroom: true,
                },
            });

            if (!user) return res.status(401).end("User doesn't exist!");

            if (user.owned_chatroom?.id === chatId)
                return res
                    .status(409)
                    .end(
                        "You cannot leave your own chatroom, delete it instead!"
                    );

            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    chatrooms: {
                        disconnect: {
                            id: chatId,
                        },
                    },
                },
            });

            await pusherServer.trigger(
                `chat__${chatId}__member-leave`,
                "member-leave",
                {
                    id: user.id,
                    chatId: chatId,
                }
            );

            res.status(201).end("Success!");
        } else {
            res.setHeader("Allow", "PATCH");
            res.status(405).end("Method Not Allowed");
        }
    } catch (error) {
        console.log("/api/chatroom/[chatId]/leave", error);
        res.status(500).end("Internal Server Error");
    }
}
