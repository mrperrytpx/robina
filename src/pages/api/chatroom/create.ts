import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../prisma/prisma";
import { randomString } from "../../../util/randomString";
import { createChatroomSchema } from "../../chats/create";
import { authOptions } from "../auth/[...nextauth]";
import { TChatroomWithOwner } from "./get_owned";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method === "POST") {
            const { name, description } = createChatroomSchema.parse(req.body);

            const session = await getServerSession(req, res, authOptions);

            if (!session) return res.status(401).end("No session!");

            const user = await prisma.user.findFirst({
                where: {
                    id: session.user.id,
                },
                include: {
                    owned_chatroom: true,
                },
            });

            if (!user) return res.status(401).end("User doesn't exist!");

            if (user.owned_chatroom)
                return res.status(409).end("You already own a chatroom!");

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

            if (!chatroom)
                return res
                    .status(500)
                    .end("Server issues! Try reloading the page.");

            await prisma.inviteLink.create({
                data: {
                    chatroom_id: chatroom.id,
                    value: inviteString,
                },
            });

            const returnChatroom: TChatroomWithOwner = {
                created_at: chatroom.created_at,
                description: chatroom.description,
                id: chatroom.id,
                name: chatroom.name,
                owner: user,
                owner_id: chatroom.owner_id,
            };

            res.status(201).json(returnChatroom);
        } else {
            res.setHeader("Allow", "POST");
            res.status(405).end("Method Not Allowed");
        }
    } catch (error) {
        console.log("/api/chatroom/create", error);
        res.status(500).end("Internal Server Error");
    }
}
