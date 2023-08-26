import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../../../../prisma/prisma";
import { authOptions } from "../../../auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method === "GET") {
            const chatId = z.string().parse(req.query.chatId);

            if (!chatId) return res.status(400).end("Provide a valid chat ID!");

            const session = await getServerSession(req, res, authOptions);

            if (!session) return res.status(401).end("No session!");

            const inviteLink = await prisma.inviteLink.findFirst({
                where: {
                    chatroom_id: chatId,
                },
            });

            if (!inviteLink)
                return res.status(400).end("No invite link generated yet!");

            res.status(200).json({ value: inviteLink.value });
        } else {
            res.setHeader("Allow", "GET");
            res.status(405).end("Method Not Allowed");
        }
    } catch (error) {
        console.log("/api/chatroom/[chatId]/invite/get", error);
        res.status(500).end("Internal Server Error");
    }
}
