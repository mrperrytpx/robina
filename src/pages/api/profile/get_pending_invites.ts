import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";

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
                    invited_to_chatroom: {
                        include: {
                            invite_link: true,
                            owner: true,
                        },
                    },
                },
            });

            if (!user) return res.status(401).end("User doesn't exist!");

            res.status(201).json(user?.invited_to_chatroom);
        } else {
            res.setHeader("Allow", "GET");
            res.status(405).end("Method Not Allowed");
        }
    } catch (error) {
        console.log("/api/profile/get_pending_invites", error);
        res.status(500).end("Internal Server Error");
    }
}
