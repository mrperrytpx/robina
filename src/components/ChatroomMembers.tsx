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
        <aside className="scrollbar-track-glacier-900scrollbar-thumb-glacier-200 flex-1 overflow-y-auto bg-glacier-600 p-3 scrollbar-thin sm:h-full sm:w-60 sm:py-0">
            {chatroomMembers.isLoading ? (
                <div className="h4 flex w-full flex-col gap-2">
                    <div className="flex h-4 w-full items-center rounded-md bg-white p-4 shadow">
                        <div className="h-3 w-full animate-pulse bg-glacier-200" />
                    </div>
                    <SkeletonLoadingCard />
                    <SkeletonLoadingCard />
                    <SkeletonLoadingCard />
                    <SkeletonLoadingCard />
                    <SkeletonLoadingCard />
                </div>
            ) : (
                <>
                    <h2 className="mb-2 rounded-md bg-white p-2 text-xs font-bold text-glacier-900 shadow">
                        Members - {chatroomMembers.data?.length}
                    </h2>
                    <div className="scrollbar-track-glacier-900scrollbar-thumb-glacier-200 flex w-full flex-col gap-2 overflow-y-auto scrollbar-thin">
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
                    <h2 className="my-2 mt-6 rounded-md bg-white p-2 text-xs font-bold text-glacier-900 shadow">
                        Pending invites - {pendingChatroomInvites.data?.length}
                    </h2>
                    <div className="scrollbar-track-glacier-900scrollbar-thumb-glacier-200 flex w-full flex-col gap-2 overflow-y-auto scrollbar-thin">
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
        </aside>
    );
};
