import { useRouter } from "next/router";
import { useCreateChatroomInviteMutation } from "../hooks/useCreateChatroomInviteMutation";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useDeleteOwnedChatroomMutation } from "../hooks/useDeleteOwnedChatroomMutation";
import { useQueryClient } from "@tanstack/react-query";
import { useLeaveChatroomMutation } from "../hooks/useLeaveChatroomMutation";
import { useGetChatroomInviteQuery } from "../hooks/useGetChatroomInviteQuery";
import { VscCopy, VscCheck, VscRefresh } from "react-icons/vsc";
import { useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { usePatchChatroomInviteMutation } from "../hooks/usePatchChatroomInviteMutation";
import { useGetBannedChatroomMembersQuery } from "../hooks/useGetBannedChatroomMembersQuery";
import Image from "next/image";
import DefaultPic from "../../public/default.png";

interface IChatroomSettingsProps {
    ownerId: string;
}

export const ChatroomSettings = ({ ownerId }: IChatroomSettingsProps) => {
    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);
    const session = useSession();
    const queryClient = useQueryClient();
    const [copied, setCopied] = useState(false);

    const createInvite = useCreateChatroomInviteMutation();
    const getInvite = useGetChatroomInviteQuery(chatId);
    const patchInvite = usePatchChatroomInviteMutation();

    const bannedMembers = useGetBannedChatroomMembersQuery(chatId);

    const deleteChatroom = useDeleteOwnedChatroomMutation();
    const leaveChatroom = useLeaveChatroomMutation();

    const dangerButtonStyles =
        "w-full max-w-[300px] rounded-lg bg-gray-100 p-2 font-semibold text-black shadow-lg hover:bg-red-600 hover:text-gray-100 focus:bg-red-600 focus:text-gray-100 active:bg-red-600 active:text-gray-100";

    const handleDeleteChatroom = async () => {
        const response = await deleteChatroom.mutateAsync({ chatId });

        if (!response.ok) return;

        router.push("/chats");
    };

    const handleLeaveChatroom = async () => {
        const response = await leaveChatroom.mutateAsync({ chatId });

        if (!response.ok) return;

        router.push("/chats");
    };

    const handleCopyInvite = () => {
        if (copied) return;

        if (typeof window != "undefined" && window.document) {
            if (!getInvite.data?.value) return;
            navigator.clipboard.writeText(getInvite.data.value);
            setCopied(true);

            const turnBackTimeout = setTimeout(() => setCopied(false), 5000);

            return () => clearTimeout(turnBackTimeout);
        }
    };

    return (
        <div className="h-full w-full overflow-y-auto bg-slate-800 px-4">
            {ownerId === session.data?.user.id ? (
                <div className="flex w-full flex-col items-center gap-4">
                    <div className="mt-6 flex w-full max-w-[300px] flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">
                            Invite Link:{" "}
                        </span>
                        <span className="rounded-lg bg-slate-900 p-2 font-mono">
                            {getInvite.data?.value
                                ? getInvite.data?.value
                                : "XXXXXXXXXX"}
                        </span>
                        <div className="flex items-center gap-2">
                            {getInvite.data?.value && (
                                <button
                                    onClick={handleCopyInvite}
                                    className="rounded-lg bg-slate-900 p-2 shadow-md"
                                >
                                    {copied ? (
                                        <VscCheck fill="#22c55e" size={24} />
                                    ) : (
                                        <VscCopy size={24} />
                                    )}
                                </button>
                            )}
                            {getInvite.data?.value && (
                                <button
                                    onClick={async () =>
                                        await patchInvite.mutateAsync({
                                            chatId,
                                        })
                                    }
                                    className="rounded-lg bg-slate-900 p-2 shadow-md"
                                >
                                    {patchInvite.isLoading ? (
                                        <LoadingSpinner size={24} />
                                    ) : (
                                        <VscRefresh size={24} />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex w-full max-w-[300px] flex-col gap-2">
                        <span className="text-sm font-semibold">
                            Banned users:{" "}
                        </span>
                        <div>
                            {bannedMembers.data?.length ? (
                                bannedMembers.data.map((member) => (
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
                                                fontWeight:
                                                    member.id === ownerId
                                                        ? "bold"
                                                        : "",
                                            }}
                                            className="truncate text-sm"
                                        >
                                            @{member.username}{" "}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div>No banned members </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleDeleteChatroom}
                        className={dangerButtonStyles + " mt-2"}
                    >
                        Delete Chatroom
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleLeaveChatroom}
                    className={dangerButtonStyles}
                >
                    Leave Chatroom
                </button>
            )}
        </div>
    );
};
