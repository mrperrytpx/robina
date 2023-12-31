import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === "DELETE") {
            const session = await getServerSession(req, res, authOptions);

            if (!session) return res.status(401).end("No session!");

            const user = await prisma.user.findFirst({
                where: {
                    id: session.user.id,
                },
            });

            if (!user) return res.status(400).end("You don't exist?!");

            await prisma.user.delete({
                where: {
                    id: user.id,
                },
            });

            res.status(204).end("Success!");
        } else {
            res.setHeader("Allow", "DELETE");
            res.status(405).end("Method Not Allowed");
        }
    } catch (error) {
        console.log("/api/profile/delete", error);
        res.status(500).end("Internal Server Error");
    }
}

export default handler;
