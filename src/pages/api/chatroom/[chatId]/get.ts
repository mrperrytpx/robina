import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../../../prisma/prisma";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method === "GET") {
            const chatId = z.string().parse(req.query.chatId);

            if (!chatId) return res.status(400).end("Provide a chat ID!");

            if (chatId.length !== 25)
                return res.status(401).end("Invalid chatroom URL!");

            const session = await getServerSession(req, res, authOptions);

            if (!session) return res.status(401).end("No session!");

            const user = await prisma.user.findFirst({
                where: {
                    id: session.user.id,
                },
                include: {
                    chatrooms: true,
                },
            });

            if (!user) return res.status(401).end("User doesn't exist!");

            if (!user.chatrooms.find((chat) => chat.id === chatId)) {
                return res
                    .status(401)
                    .end("You're not a member of this chatroom!");
            }

            const chatroom = await prisma.chatroom.findFirst({
                where: {
                    id: chatId,
                },
            });

            if (!chatroom)
                return res.status(400).end("No chatroom with that ID!");

            res.status(201).json(chatroom);
        } else {
            res.setHeader("Allow", "GET");
            res.status(405).end("Method Not Allowed");
        }
    } catch (error) {
        console.log("/api/chatroom/[chatId]/get", error);
        res.status(500).end("Internal Server Error");
    }
}
