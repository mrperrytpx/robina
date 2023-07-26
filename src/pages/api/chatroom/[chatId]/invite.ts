import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../../../prisma/prisma";
import { authOptions } from "../../auth/[...nextauth]";
import { pusherServer } from "../../../../lib/pusher";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const chatId = z.string().parse(req.query.chatId);
        const username = z.string().parse(req.body.username);

        if (!chatId) return res.status(400).end("Please provide an ID!");
        if (!username) return res.status(400).end("Please provide a username");

        const session = await getServerSession(req, res, authOptions);

        if (!session) return res.status(401).end("No session!");

        const user = await prisma.user.findFirst({
            where: {
                id: session.user.id,
            },
            include: {
                owned_chatroom: {
                    include: {
                        invite_link: true,
                        owner: true,
                    },
                },
            },
        });
        if (!user) return res.status(401).end("User doesn't exist!!");

        if (!user.owned_chatroom) {
            return res.status(400).end("You do not own a chatroom!");
        }

        if (user.owned_chatroom?.id !== chatId) {
            return res.status(403).end("You do not own this chatroom!");
        }

        if (user.username === username.toLowerCase())
            return res.status(409).end("You cannot invite yourself!");

        const member = await prisma.user.findFirst({
            where: {
                username: username.toLowerCase(),
            },
            include: {
                banned_from_chatroom: true,
                invited_to_chatroom: true,
            },
        });

        if (!member) return res.status(400).end("User doesn't exist!");

        if (
            member.banned_from_chatroom.find(
                (chatroom) => chatroom.id === chatId
            )
        ) {
            return res
                .status(409)
                .end(`"${member.username}" is banned from this chatroom!`);
        }

        if (
            member.invited_to_chatroom.find(
                (chatroom) => chatroom.id === chatId
            )
        ) {
            return res.status(409).end("User is already invited!");
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

        await pusherServer.trigger(
            `chat__${member.id}__new-invite`,
            "new-invite",
            {
                ...user.owned_chatroom,
            }
        );

        await pusherServer.trigger(
            `chat__${chatId}__chat-invite`,
            "chat-invite",
            {
                ...member,
            }
        );

        res.status(204).end("Success");
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}
