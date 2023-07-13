import { User } from "@prisma/client";
import React from "react";
import DefaultPic from "../../public/default.png";
import Image from "next/image";

interface IChatroomMembersProps {
    members: User[];
    ownerId: string;
}

export const ChatroomMembers = ({
    members,
    ownerId,
}: IChatroomMembersProps) => {
    return (
        <div className="z-20 flex h-full w-full flex-col bg-slate-800 sm:w-60">
            <h2 className="p-2 text-xs shadow-md">
                Members - {members.length}
            </h2>
            <div className="flex w-full flex-col overflow-y-auto scrollbar-thin scrollbar-track-black scrollbar-thumb-slate-400">
                {members.map((member) => (
                    <div
                        key={member.id}
                        className="flex items-center gap-2 p-2"
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
                    </div>
                ))}
            </div>
        </div>
    );
};
