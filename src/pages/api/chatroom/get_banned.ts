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

        if (!chatId) return res.status(404).end("Provide a chat ID");

        const session = await getServerSession(req, res, authOptions);

        if (!session) return res.status(401).end("No session");

        const user = await prisma.user.findFirst({
            where: {
                id: session.user.id,
            },
            include: {
                owned_chatroom: {
                    include: {
                        banned_members: true,
                    },
                },
            },
        });

        if (!user) return res.status(401).end("No user");

        if (!user.owned_chatroom)
            return res.status(400).end("You don't own a chatroom");

        if (user.owned_chatroom.id !== chatId)
            return res.status(401).end("You don't own this chatroom");

        const bannedMembers = user.owned_chatroom.banned_members;

        res.status(200).json(bannedMembers);
    } else {
        res.setHeader("Allow", "GET");
        res.status(405).end("Method Not Allowed");
    }
}
