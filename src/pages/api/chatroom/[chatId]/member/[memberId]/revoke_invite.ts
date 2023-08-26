import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../../../../../prisma/prisma";
import { pusherServer } from "../../../../../../lib/pusher";
import { authOptions } from "../../../../auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method === "PATCH") {
            const chatId = z.string().parse(req.query.chatId);
            const memberId = z.string().parse(req.query.memberId);

            if (!chatId) return res.status(400).end("Provide a valid chat ID!");

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

            if (!user.owned_chatroom) {
                return res.status(401).end("You do not own a chatroom!");
            }

            if (user.owned_chatroom?.id !== chatId) {
                return res.status(403).end("You do not own this chatroom!");
            }

            const member = await prisma.user.findFirst({
                where: {
                    id: memberId,
                },
                include: {
                    invited_to_chatroom: true,
                },
            });

            if (!member)
                return res
                    .status(400)
                    .end(
                        "User doesn't have a pending invite for this chatroom!"
                    );

            await prisma.user.update({
                where: {
                    id: member.id,
                },
                data: {
                    invited_to_chatroom: {
                        disconnect: {
                            id: chatId,
                        },
                    },
                },
            });

            await pusherServer.trigger(
                `chat__${member.id}__revoke-invite`,
                "revoke-invite",
                {
                    chatId,
                    userId: member.id,
                }
            );

            await pusherServer.trigger(
                `chat__${chatId}__decline-invite`,
                "decline-invite",
                {
                    chatId,
                    userId: member.id,
                }
            );

            res.status(204).end("Success!");
        } else {
            res.setHeader("Allow", "PATCH");
            res.status(405).end("Method Not Allowed");
        }
    } catch (error) {
        console.log(
            "/api/chatroom/[chatId]/member/[memberId]/revoke_invite",
            error
        );
        res.status(500).end("Internal Server Error");
    }
}
