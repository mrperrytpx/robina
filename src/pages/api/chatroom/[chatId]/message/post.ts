import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../../../prisma/prisma";
import { pusherServer } from "../../../../../lib/pusher";
import { chatMessageSchema } from "../../../../../lib/zSchemas";
import { authOptions } from "../../../auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method === "POST") {
            const { message } = chatMessageSchema.parse(req.body);
            const { fakeId } = req.body;
            const { chatId } = req.query;

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
            if (!user.username)
                return res
                    .status(302)
                    .redirect(process.env.NEXTAUTH_URL! + "/force-username");

            const isMemberOfChatroom = user?.chatrooms.find(
                (chat) => chat.id === chatId
            );

            if (!isMemberOfChatroom)
                return res
                    .status(403)
                    .end("You're not a part of this chatroom!");

            const newMessage = await prisma.message.create({
                data: {
                    content: message,
                    author_id: user.id,
                    chatroom_id: isMemberOfChatroom.id,
                },
                include: {
                    author: true,
                },
            });

            await pusherServer.trigger(
                `chat__${chatId}__new-message`,
                "new-message",
                {
                    ...newMessage,
                    fakeId,
                }
            );

            res.status(204).end("Success!");
        } else {
            res.setHeader("Allow", "POST");
            res.status(405).end("Method Not Allowed");
        }
    } catch (error) {
        console.log("/api/chatroom/[chatId]/message/post", error);
        res.status(500).end("Internal Server Error");
    }
}
