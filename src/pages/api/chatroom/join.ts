import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../../prisma/prisma";
import { pusherServer } from "../../../lib/pusher";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const inviteLink = z
            .string()
            .min(10, "Invite link needs to be 10 chars")
            .parse(req.body.inviteLink);

        if (!inviteLink) return res.status(404).end("Invalid invite string");

        const session = await getServerSession(req, res, authOptions);

        if (!session) return res.status(401).end("No session");

        const user = await prisma.user.findFirst({
            where: {
                id: session.user.id,
            },
            include: {
                invited_to_chatroom: {
                    include: {
                        invite_link: true,
                    },
                },
            },
        });

        if (!user) return res.status(401).end("No user");

        const chatroom = await prisma.chatroom.findFirst({
            where: {
                invite_link: {
                    value: inviteLink,
                },
            },
            include: {
                banned_members: true,
                invited_members: true,
            },
        });

        if (!chatroom) return res.status(404).end("Invalid invite string");

        if (chatroom.banned_members.find((member) => member.id === user.id)) {
            return res.status(403).end("You are banned from this chatroom");
        }

        await prisma.chatroom.update({
            where: {
                id: chatroom.id,
            },
            data: {
                members: {
                    connect: {
                        id: user.id,
                    },
                },
                invited_members: {
                    disconnect: {
                        id: user.id,
                    },
                },
            },
        });

        await pusherServer.trigger(
            `chat__${chatroom.id}__new-member`,
            "new-member",
            {
                ...user,
            }
        );

        res.status(201).json(chatroom);
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}
