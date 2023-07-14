import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";
import { z } from "zod";
import { randomString } from "../../../util/randomString";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "PATCH") {
        const chatId = z.string().parse(req.query.chatId);
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

        if (!user.owned_chatroom)
            return res.status(400).end("You don't own a chatroom");

        if (user.owned_chatroom.id !== chatId)
            return res.status(401).end("You don't own this chatroom");

        const inviteString = randomString(10);

        const inviteLink = await prisma.inviteLink.update({
            where: {
                chatroom_id: user.owned_chatroom.id,
            },
            data: {
                value: inviteString,
            },
        });

        res.status(200).json({ value: inviteLink.value });
    } else {
        res.setHeader("Allow", "PATCH");
        res.status(405).end("Method not allowed");
    }
}
