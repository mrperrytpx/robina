import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../../../../../prisma/prisma";
import { pusherServer } from "../../../../../../lib/pusher";
import { authOptions } from "../../../../auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "DELETE") {
        const chatId = z.string().parse(req.query.chatId);
        const memberId = z.string().parse(req.query.memberId);

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

        const member = await prisma.user.findFirst({
            where: {
                id: memberId,
            },
            include: {
                chatrooms: true,
                messages: true,
            },
        });

        if (!member) return res.status(404).end("User isn't in this chatroom");

        await prisma.user.update({
            where: {
                id: member.id,
            },
            data: {
                chatrooms: {
                    set: member.chatrooms.filter((chat) => chat.id !== chatId),
                },
            },
        });

        await prisma.message.deleteMany({
            where: {
                id: {
                    in: member.messages
                        .filter((msg) => msg.chatroom_id === chatId)
                        .map((msg) => msg.id),
                },
            },
        });

        await prisma.chatroom.update({
            where: {
                id: chatId,
            },
            data: {
                banned_members: {
                    connect: {
                        id: member.id,
                    },
                },
            },
        });

        await pusherServer.trigger(
            `chat__${user.owned_chatroom?.id}__remove-member`,
            "remove-member",
            {
                id: memberId,
            }
        );

        res.status(204).end("Success");
    } else {
        res.setHeader("Allow", "DELETE");
        res.status(405).end("Method Not Allowed");
    }
}
