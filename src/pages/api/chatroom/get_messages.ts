import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        const { chatId } = req.query;

        if (!chatId) return res.status(400).end("Provide a chat iD");

        const session = await getServerSession(req, res, authOptions);

        if (!session) return res.status(401).end("No session");

        const user = await prisma.user.findFirst({
            where: {
                id: session.user.id,
            },
        });

        if (!user) return res.status(401).end("No user");

        const messages = await prisma.message.findMany({
            where: {
                chatroom_id: chatId as string,
            },
        });

        res.status(201).json(messages);
    } else {
        res.setHeader("Allow", "GET");
        res.status(405).end("Method Not Allowed");
    }
}
