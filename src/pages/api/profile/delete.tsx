import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "DELETE") {
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

        await prisma.message.deleteMany({
            where: {
                author_id: user.id,
            },
        });

        if (user.owned_chatroom) {
            await prisma.chatroom.delete({
                where: {
                    owner_id: user.id,
                },
            });
        }

        await prisma.user.delete({
            where: {
                id: user.id,
            },
        });

        res.status(204).end();
    } else {
        res.setHeader("Allow", "DELETE");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;