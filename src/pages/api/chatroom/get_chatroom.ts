import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";
import { z } from "zod";
import { User, Chatroom } from "@prisma/client";
import { TChatroomMessage } from "../../../hooks/useGetChatroomQuery";

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
        });

        if (!user) return res.status(401).end("No user");

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