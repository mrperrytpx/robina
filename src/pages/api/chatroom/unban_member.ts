import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";
import { z } from "zod";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "PATCH") {
        const chatId = z.string().parse(req.query.chatId);
        const memberId = z.string().parse(req.query.memberId);

        console.log("unban attempt");

        if (!chatId) return res.status(400).end("Please provide an ID");
        if (!memberId) return res.status(400).end("Please provide a user ID");

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

        if (!user.owned_chatroom) {
            return res.status(400).end("You do not own a chatroom");
        }

        if (user.owned_chatroom?.id !== chatId) {
            return res.status(401).end("You do not own this chatroom");
        }

        const member = await prisma.user.findFirst({
            where: {
                id: memberId,
            },
            include: {
                banned_from_chatroom: true,
            },
        });

        if (!member) return res.status(404).end("User isn't in this chatroom");

        await prisma.user.update({
            where: {
                id: member.id,
            },
            data: {
                banned_from_chatroom: {
                    set: member.banned_from_chatroom.filter(
                        (chat) => chat.id !== chatId
                    ),
                },
            },
        });

        res.status(204).end("Success");
    } else {
        res.setHeader("Allow", "PATCH");
        res.status(405).end("Method Not Allowed");
    }
}
