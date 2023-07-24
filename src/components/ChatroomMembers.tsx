import React from "react";
import { useBanChatroomMemberMutation } from "../hooks/useBanChatroomMemberMutation";
import { z } from "zod";
import { useRouter } from "next/router";
import { MemberCard, SkeletonLoadingCard } from "./MemberCard";
import { useGetChatroomMembersQuery } from "../hooks/useGetChatroomMembersQuery";
import { useGetChatroomPendingInvites } from "../hooks/useGetChatroomPendingInvites";
import { useRevokeChatroomInviteMutation } from "../hooks/useRevokeChatroomInviteMutation";

interface IChatroomMembersProps {
    ownerId: string;
}

export const ChatroomMembers = ({ ownerId }: IChatroomMembersProps) => {
    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);

    const banChatroomMember = useBanChatroomMemberMutation();
    const revokeInvite = useRevokeChatroomInviteMutation();
    const chatroomMembers = useGetChatroomMembersQuery(chatId);
    const pendingChatroomInvites = useGetChatroomPendingInvites(chatId);

    return (
        <div className="flex-1 overflow-y-auto border-t-2 border-black bg-sky-500 px-3 scrollbar-thin scrollbar-track-black scrollbar-thumb-sky-100 sm:h-full sm:w-60 sm:border-t-0 sm:border-black">
            {chatroomMembers.isLoading ? (
                <div className="h4 flex w-full flex-col gap-2">
                    <div className="mt-2 h-4 w-full animate-pulse rounded-md bg-white p-4 shadow" />
                    <SkeletonLoadingCard />
                    <SkeletonLoadingCard />
                    <SkeletonLoadingCard />
                    <SkeletonLoadingCard />
                    <SkeletonLoadingCard />
                </div>
            ) : (
                <>
                    <h2 className="my-2 rounded-md bg-white p-2 text-xs font-bold shadow">
                        Members - {chatroomMembers.data?.length}
                    </h2>
                    <div className="flex w-full flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-track-black scrollbar-thumb-sky-100">
                        {chatroomMembers.data?.map((member) => (
                            <MemberCard
                                key={member.id}
                                member={member}
                                ownerId={ownerId}
                                loading={banChatroomMember.isLoading}
                                onClick={async () => {
                                    await banChatroomMember.mutateAsync({
                                        chatId,
                                        memberId: member.id,
                                    });
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
            {pendingChatroomInvites.data?.length ? (
                <>
                    <h2 className="my-2 mt-6 rounded-md bg-white p-2 text-xs font-bold shadow">
                        Pending invites - {pendingChatroomInvites.data?.length}
                    </h2>
                    <div className="flex w-full flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-track-black scrollbar-thumb-sky-100">
                        {pendingChatroomInvites.data?.map((member) => (
                            <MemberCard
                                key={member.id}
                                member={member}
                                ownerId={ownerId}
                                opaque={true}
                                loading={revokeInvite.isLoading}
                                onClick={async () => {
                                    await revokeInvite.mutateAsync({
                                        chatId,
                                        memberId: member.id,
                                    });
                                }}
                            />
                        ))}
                    </div>
                </>
            ) : null}
        </div>
    );
};
