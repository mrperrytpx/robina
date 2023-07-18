import React from "react";
import { useBanChatroomMemberMutation } from "../hooks/useBanChatroomMemberMutation";
import { z } from "zod";
import { useRouter } from "next/router";
import { MemberCard } from "./MemberCard";
import { useGetChatroomMembersQuery } from "../hooks/useGetChatroomMembersQuery";

interface IChatroomMembersProps {
    ownerId: string;
}

export const ChatroomMembers = ({ ownerId }: IChatroomMembersProps) => {
    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);

    const banChatroomMember = useBanChatroomMemberMutation();
    const chatroomMembers = useGetChatroomMembersQuery(chatId);

    return (
        <div className="flex-1 overflow-y-auto bg-slate-800 px-6 scrollbar-thin scrollbar-track-black scrollbar-thumb-slate-400 sm:h-full sm:w-60">
            <h2 className="p-2 text-xs shadow-md">
                Members - {chatroomMembers.data?.length}
            </h2>
            <div className="flex w-full flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-track-black scrollbar-thumb-slate-400">
                {chatroomMembers.data?.map((member) => (
                    <MemberCard
                        key={member.id}
                        member={member}
                        ownerId={ownerId}
                        onClick={async () => {
                            await banChatroomMember.mutateAsync({
                                chatId,
                                memberId: member.id,
                            });
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
