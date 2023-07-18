import { Chatroom, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../../../prisma/prisma";
import { TChatroomMessage } from "../../../../hooks/useGetChatroomQuery";
import { authOptions } from "../../auth/[...nextauth]";

export type TChatroomData = Chatroom & {
    members: User[];
    owner: User;
    messages: TChatroomMessage[];
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        const chatId = z.string().parse(req.query.chatId);

        if (!chatId) return res.status(400).end("Provide a chat iD");

        const session = await getServerSession(req, res, authOptions);

        if (!session) return res.status(401).end("No session");

        const user = await prisma.user.findFirst({
            where: {
                id: session.user.id,
            },
            include: {
                chatrooms: true,
            },
        });

        if (!user) return res.status(401).end("No user");

        if (!user.chatrooms.find((chat) => chat.id === chatId)) {
            return res.status(401).end("You're not a member of this chatroom");
        }

        const chatroom = await prisma.chatroom.findFirst({
            where: {
                id: chatId,
            },
            include: {
                members: true,
                owner: true,
                messages: {
                    include: {
                        author: true,
                    },
                },
            },
        });

        if (!chatroom) return res.status(404).end("No chatroom with that ID");

        res.status(201).json(chatroom);
    } else {
        res.setHeader("Allow", "GET");
        res.status(405).end("Method Not Allowed");
    }
}
