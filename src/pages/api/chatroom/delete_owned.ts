import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "DELETE") {
        const { id } = req.query;

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

        if (user.owned_chatroom?.id !== id)
            return res.status(401).end("You do not own this chatroom");

        const chatroom = await prisma.chatroom.findFirst({
            where: {
                id: user?.owned_chatroom?.id,
            },
        });

        if (!chatroom) return res.status(400).end("You do not own a chatroom");

        await prisma.chatroom.delete({
            where: {
                id: chatroom.id,
            },
        });

        res.status(201).end("Success");
    } else {
        res.setHeader("Allow", "DELETE");
        res.status(405).end("Method Not Allowed");
    }
}
