import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";
import { z } from "zod";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        const chatId = z.string().parse(req.query.chatId);

        if (!chatId) return res.status(400).end("Provide a chat iD");

        const session = await getServerSession(req, res, authOptions);

        if (!session) return res.status(401).end("No session");

        const user = await prisma.user.findFirst({
            where: {
                id: session.user.id,
            },
        });

        if (!user) return res.status(401).end("No user");

        const chatroom = await prisma.chatroom.findFirst({
            where: {
                id: chatId,
            },
            include: {
                banned_members: true,
                messages: {
                    include: {
                        author: {
                            select: {
                                username: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        });

        if (!chatroom) return res.status(404).end("No chatroom with that ID");

        const isUserBanned = chatroom.banned_members.find(
            (bannedUser) => bannedUser.id === user.id
        );

        if (isUserBanned) {
            return res.status(403).end("You are banned from this chatroom");
        }

        const messages = chatroom.messages.slice(0, 50);

        res.status(201).json(messages);
    } else {
        res.setHeader("Allow", "GET");
        res.status(405).end("Method Not Allowed");
    }
}
