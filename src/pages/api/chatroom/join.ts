import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../../prisma/prisma";
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

        if (!inviteLink) return res.status(404).end("Invalid invite link");

        const session = await getServerSession(req, res, authOptions);

        if (!session) return res.status(401).end("No session");

        const user = await prisma.user.findFirst({
            where: {
                id: session.user.id,
            },
        });

        if (!user) return res.status(401).end("No user");

        const chatroom = await prisma.chatroom.findFirst({
            where: {
                invite_link: {
                    value: inviteLink,
                },
            },
        });

        if (!chatroom) return res.status(404).end("Invalid invite link");

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
            },
        });

        res.status(201).end();
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}
