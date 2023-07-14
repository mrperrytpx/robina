import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";
import { z } from "zod";

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

        if (!user.owned_chatroom) {
            return res.status(400).end("You do not own a chatroom");
        }

        if (user.owned_chatroom?.id !== chatId) {
            return res.status(401).end("You do not own this chatroom");
        }

        await prisma.chatroom.delete({
            where: {
                id: user.owned_chatroom.id,
            },
        });

        res.status(204).end("Success");
    } else {
        res.setHeader("Allow", "DELETE");
        res.status(405).end("Method Not Allowed");
    }
}
