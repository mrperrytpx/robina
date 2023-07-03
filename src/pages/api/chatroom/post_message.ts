import { NextApiRequest, NextApiResponse } from "next";
import { chatMessageSchema } from "../../chats/[chatId]";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";
import { pusherServer } from "../../../lib/pusher";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const { message } = chatMessageSchema.parse(req.body);
        const { chatId } = req.query;

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

        const isMemberOfChatroom = user?.chatrooms.find(
            (chat) => chat.id === chatId
        );

        if (!isMemberOfChatroom)
            return res.status(401).end("Not a part of this chatroom");

        const newMessage = await prisma.message.create({
            data: {
                content: message,
                author_id: user.id,
                chatroom_id: isMemberOfChatroom.id,
            },
        });

        pusherServer.trigger(
            `chat__${chatId}__new-message`,
            "new-message",
            newMessage
        );

        res.status(201).end();
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}
