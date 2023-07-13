import { User } from "@prisma/client";
import React from "react";
import DefaultPic from "../../public/default.png";
import Image from "next/image";
import { VscCircleSlash } from "react-icons/vsc";
import { useDeleteChatroomMemberMutation } from "../hooks/useDeleteChatroomMemberMutation";
import { z } from "zod";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

interface IChatroomMembersProps {
    members: User[];
    ownerId: string;
}

export const ChatroomMembers = ({
    members,
    ownerId,
}: IChatroomMembersProps) => {
    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);
    const session = useSession();

    const deleteChatroomMember = useDeleteChatroomMemberMutation();

    return (
        <div className="z-20 flex h-full w-full flex-col bg-slate-800 sm:w-60">
            <h2 className="p-2 text-xs shadow-md">
                Members - {members.length}
            </h2>
            <div className="flex w-full flex-col overflow-y-auto scrollbar-thin scrollbar-track-black scrollbar-thumb-slate-400">
                {members.map((member) => (
                    <div
                        key={member.id}
                        className="group relative flex items-center gap-2 p-2 hover:bg-slate-900 focus:bg-slate-900 active:bg-slate-900"
                    >
                        <div className="aspect-square w-8">
                            <Image
                                src={member.image ?? DefaultPic}
                                alt={`${member.username}'s image`}
                                width={100}
                                height={100}
                                className="w-full min-w-[32px] rounded-full"
                            />
                        </div>
                        <span
                            style={{
                                fontWeight: member.id === ownerId ? "bold" : "",
                            }}
                            className="truncate text-sm"
                        >
                            @{member.username} {member.id === ownerId && "- 🦁"}
                        </span>
                        {member.id !== ownerId &&
                            session.data?.user.id === ownerId && (
                                <button
                                    onClick={async () => {
                                        await deleteChatroomMember.mutateAsync({
                                            chatId,
                                            memberId: member.id,
                                        });
                                    }}
                                    className="group-target::block absolute right-1 top-1/2 hidden -translate-y-1/2 cursor-pointer p-1 group-hover:block"
                                >
                                    <VscCircleSlash size={28} fill="red" />
                                </button>
                            )}
                    </div>
                ))}
            </div>
        </div>
    );
};
