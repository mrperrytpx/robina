import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../../../../prisma/prisma";
import { randomString } from "../../../../../util/randomString";
import { authOptions } from "../../../auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
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
                owned_chatroom: true,
            },
        });

        if (!user) return res.status(400).end("User doesn't exist!");

        if (!user.owned_chatroom)
            return res.status(400).end("You don't own a chatroom!");

        if (user.owned_chatroom.id !== chatId)
            return res.status(403).end("You don't own this chatroom!");

        const inviteString = randomString(10);

        const inviteLink = await prisma.inviteLink.update({
            where: {
                chatroom_id: user.owned_chatroom.id,
            },
            data: {
                value: inviteString,
            },
        });

        res.status(201).json({ value: inviteLink.value });
    } else {
        res.setHeader("Allow", "PATCH");
        res.status(405).end("Method not allowed");
    }
}
