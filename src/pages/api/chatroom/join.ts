import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../../prisma/prisma";
import { pusherServer } from "../../../lib/pusher";
import { authOptions } from "../auth/[...nextauth]";
import { User } from "@prisma/client";
import { TChatroomInvite } from "../../../hooks/useGetUserPendingInvitesQuery";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const inviteLink = z
            .string()
            .min(10, "Invite link needs to be 10 chars")
            .parse(req.body.inviteLink);

        if (!inviteLink) return res.status(404).end("Invalid invite string");

        const session = await getServerSession(req, res, authOptions);

        if (!session) return res.status(401).end("No session");

        const user = await prisma.user.findFirst({
            where: {
                id: session.user.id,
            },
            include: {
                invited_to_chatroom: {
                    include: {
                        invite_link: true,
                    },
                },
                chatrooms: true,
            },
        });

        if (!user) return res.status(401).end("No user");

        if (user.chatrooms.length === 5)
            return res
                .status(404)
                .end("You can only be a part of 5 chatrooms!");

        const chatroom = await prisma.chatroom.findFirst({
            where: {
                invite_link: {
                    value: inviteLink,
                },
            },
            include: {
                banned_members: true,
                invited_members: true,
                owner: true,
                invite_link: true,
            },
        });

        if (!chatroom) return res.status(404).end("Invalid invite string");

        if (chatroom.banned_members.find((member) => member.id === user.id)) {
            return res.status(403).end("You are banned from this chatroom");
        }

        await prisma.chatroom.update({
            where: {
                id: chatroom.id,
            },
            data: {
                members: {
                    connect: {
                        id: user.id,
                    },
                },
                invited_members: {
                    disconnect: {
                        id: user.id,
                    },
                },
            },
        });

        const returnUser: User = {
            created_at: user.created_at,
            email: user.email,
            emailVerified: user.emailVerified,
            id: user.id,
            image: user.image,
            name: user.name,
            username: user.username,
        };

        await pusherServer.trigger(
            `chat__${chatroom.id}__new-member`,
            "new-member",
            {
                ...returnUser,
            }
        );

        const returnChatroom: TChatroomInvite = {
            id: chatroom.id,
            created_at: chatroom.created_at,
            description: chatroom.description,
            name: chatroom.name,
            owner_id: chatroom.owner_id,
            owner: chatroom.owner,
            invite_link: chatroom.invite_link!,
        };

        res.status(201).json(returnChatroom);
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}
