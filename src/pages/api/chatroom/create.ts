import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../prisma/prisma";
import { randomString } from "../../../util/randomString";
import { createChatroomSchema } from "../../chats/create";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const { name, description } = createChatroomSchema.parse(req.body);

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

        if (user.owned_chatroom)
            return res.status(400).end("You already own a chatroom");

        const chatroom = await prisma.chatroom.create({
            data: {
                name,
                description,
                owner: {
                    connect: {
                        id: user.id,
                    },
                },
                members: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        });

        const inviteString = randomString(10);

        if (!chatroom) return res.status(500).end("Server issues");

        await prisma.inviteLink.create({
            data: {
                chatroom_id: chatroom.id,
                value: inviteString,
            },
        });

        res.status(201).json(chatroom);
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}
