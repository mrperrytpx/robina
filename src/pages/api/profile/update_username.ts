import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";
import { usernameSchema } from "../../force-username";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "PATCH") {
        const { username } = usernameSchema.parse(req.body);

        if (!username) return res.status(404).end("No username provided!");

        if (username.split(" ").length > 1)
            return res.status(404).end("No spaces allowed!");

        const session = await getServerSession(req, res, authOptions);

        if (!session) return res.status(401).end("No session!");

        const user = await prisma.user.findFirst({
            where: {
                id: session.user.id,
            },
        });

        if (!user) return res.status(401).end("No user!");

        const usernameExsits = await prisma.user.findFirst({
            where: {
                username,
            },
        });

        if (usernameExsits)
            return res.status(409).end("Username already taken!");

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                username,
            },
        });

        res.status(201).end("Success!");
    } else {
        res.setHeader("Allow", "PATCH");
        res.status(405).end("Method Not Allowed!");
    }
}
