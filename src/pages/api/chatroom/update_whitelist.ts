import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";
import { usernameSchema } from "../../profile/username";
import { z } from "zod";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "PATCH") {
        const { username } = usernameSchema.parse(req.body);
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
            return res.status(404).end("You don't own a chatroom");

        if (user.owned_chatroom.id !== chatId)
            return res.status(401).end("You don't own this chatroom");

        // add ban check

        await prisma.chatroom.update({
            where: {
                id: chatId,
            },
            data: {
                whitelisted: {
                    connect: {
                        username,
                    },
                },
            },
        });

        res.status(201).end("Success");
    } else {
        res.setHeader("Allow", "PATCH");
        res.status(405).end("Method Not Allowed");
    }
}
