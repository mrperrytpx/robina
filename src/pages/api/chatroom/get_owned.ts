import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";
import { Chatroom, User } from "@prisma/client";

export type TChatroomWithOwner = Chatroom & { owner: User };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method === "GET") {
            const session = await getServerSession(req, res, authOptions);

            if (!session) return res.status(401).end("No session!");

            const user = await prisma.user.findFirst({
                where: {
                    id: session.user.id,
                },
                include: {
                    owned_chatroom: {
                        include: {
                            owner: true,
                        },
                    },
                },
            });

            if (!user) return res.status(401).end("User doesn't exist!");

            res.status(200).json(user.owned_chatroom);
        } else {
            res.setHeader("Allow", "GET");
            res.status(405).end("Method Not Allowed");
        }
    } catch (error) {
        console.log("/api/chatroom/get_owned", error);
        res.status(500).end("Internal Server Error");
    }
}
