import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../../../prisma/prisma";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const chatId = z.string().parse(req.query.chatId);
        const username = z.string().parse(req.body.username);

        if (!chatId) return res.status(404).end("Please provide an ID!");
        if (!username) return res.status(404).end("Please provide a username");

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
        if (!user) return res.status(401).end("No user!");

        if (!user.owned_chatroom) {
            return res.status(400).end("You do not own a chatroom!");
        }

        if (user.owned_chatroom?.id !== chatId) {
            return res.status(401).end("You do not own this chatroom!");
        }

        const member = await prisma.user.findFirst({
            where: {
                username,
            },
            include: {
                banned_from_chatroom: true,
                invited_to_chatroom: true,
            },
        });

        if (!member) return res.status(404).end("User isn't in this chatroom!");

        if (
            member.banned_from_chatroom.find(
                (chatroom) => chatroom.id === chatId
            )
        ) {
            return res.status(404).end("User is banned from this chatroom!");
        }

        if (
            member.invited_to_chatroom.find(
                (chatroom) => chatroom.id === chatId
            )
        ) {
            return res.status(404).end("User is already invited!");
        }

        await prisma.user.update({
            where: {
                id: member.id,
            },
            data: {
                invited_to_chatroom: {
                    connect: {
                        id: chatId,
                    },
                },
            },
        });

        res.status(204).end("Success");
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}
