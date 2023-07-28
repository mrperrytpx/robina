import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../../../prisma/prisma";
import { authOptions } from "../../auth/[...nextauth]";
import { AES, enc } from "crypto-js";

const decryptMessage = (str: string) => {
    return JSON.parse(
        AES.decrypt(str, process.env.SOMETHING_COOL as string).toString(
            enc.Utf8
        )
    );
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        const chatId = z.string().parse(req.query.chatId);
        const offset = +z.string().parse(req.query.offset);

        if (!chatId) return res.status(400).end("Provide a valid chat ID!");

        const session = await getServerSession(req, res, authOptions);

        if (!session) return res.status(401).end("No session!");

        const user = await prisma.user.findFirst({
            where: {
                id: session.user.id,
            },
            include: {
                chatrooms: true,
            },
        });

        if (!user) return res.status(401).end("User doesn't exist!");

        if (!user.chatrooms.find((chat) => chat.id === chatId)) {
            return res.status(401).end("You're not a member of this chatroom!");
        }

        let chatroom = await prisma.chatroom.findFirst({
            where: {
                id: chatId,
            },
            include: {
                messages: {
                    include: {
                        author: true,
                    },
                    take: 50,
                    orderBy: {
                        created_at: "desc",
                    },
                    skip: offset,
                },
            },
        });

        const decryptedMessages = chatroom?.messages.map((message) => {
            const decryptedMsg = decryptMessage(message.content);
            return {
                ...message,
                content: decryptedMsg.str,
            };
        });

        if (!chatroom) return res.status(400).end("Chatroom doesn't exist!?");

        res.status(201).json(decryptedMessages);
    } else {
        res.setHeader("Allow", "GET");
        res.status(405).end("Method Not Allowed");
    }
}
