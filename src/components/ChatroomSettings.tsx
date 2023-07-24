import { useRouter } from "next/router";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useDeleteOwnedChatroomMutation } from "../hooks/useDeleteOwnedChatroomMutation";
import { useLeaveChatroomMutation } from "../hooks/useLeaveChatroomMutation";
import { useGetChatroomInviteQuery } from "../hooks/useGetChatroomInviteQuery";
import { VscCopy, VscCheck, VscRefresh } from "react-icons/vsc";
import { useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { usePatchChatroomInviteMutation } from "../hooks/usePatchChatroomInviteMutation";
import { useGetBannedChatroomMembersQuery } from "../hooks/useGetBannedChatroomMembersQuery";
import { useUnbanChatroomMemberMutation } from "../hooks/useUnbanChatroomMemberMutation";
import { MemberCard } from "./MemberCard";
import { Portal } from "./Portal";

interface IChatroomSettingsProps {
    ownerId: string;
    description: string;
}

export const ChatroomSettings = ({
    ownerId,
    description,
}: IChatroomSettingsProps) => {
    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);
    const session = useSession();
    const [copied, setCopied] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getInvite = useGetChatroomInviteQuery(chatId);
    const patchInvite = usePatchChatroomInviteMutation();

    const bannedMembers = useGetBannedChatroomMembersQuery(
        chatId,
        ownerId === session.data?.user.id
    );
    const unbanMember = useUnbanChatroomMemberMutation();

    const deleteChatroom = useDeleteOwnedChatroomMutation();
    const leaveChatroom = useLeaveChatroomMutation();

    const dangerButtonStyles =
        "w-full rounded-lg bg-white p-2 max-w-[min(100%,400px)] font-semibold text-black shadow hover:bg-red-600 hover:text-gray-100 focus:bg-red-600 focus:text-gray-100 active:bg-red-600 active:text-gray-100";

    const handleDeleteChatroom = async () => {
        setIsModalOpen(false);
        const { response } = await deleteChatroom.mutateAsync({ chatId });

        if (!response.ok) return;

        router.push("/chats");
    };

    const handleLeaveChatroom = async () => {
        const { response } = await leaveChatroom.mutateAsync({ chatId });

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
        <div className="flex-1 space-y-8 overflow-y-auto border-t-2 border-black bg-sky-500 px-4 scrollbar-thin scrollbar-track-black scrollbar-thumb-sky-100">
            <div className="mt-4 space-y-2">
                <h3 className="block text-center text-sm font-bold uppercase text-sky-50 sm:text-left">
                    Chatroom description:
                </h3>
                <p className="rounded-md bg-white p-2 text-center text-sm shadow sm:text-left">
                    {description}
                </p>
            </div>
            {ownerId === session.data?.user.id ? (
                <div className="flex w-full flex-col items-center gap-4 md:items-start">
                    <div className="flex w-full flex-wrap items-center justify-center gap-2 md:justify-normal">
                        <span className="text-sm font-semibold uppercase text-sky-50">
                            Invite Link:{" "}
                        </span>
                        <span className="rounded-lg bg-white p-2 font-mono shadow">
                            {getInvite.data?.value
                                ? getInvite.data?.value
                                : "XXXXXXXXXX"}
                        </span>
                        <div className="flex items-center gap-2">
                            {getInvite.data?.value && (
                                <button
                                    onClick={handleCopyInvite}
                                    className="rounded-lg bg-white p-2 shadow"
                                >
                                    {copied ? (
                                        <VscCheck
                                            fill="rgb(14 165 233)"
                                            size={24}
                                        />
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
                                    className="rounded-lg bg-white p-2 shadow"
                                >
                                    {patchInvite.isLoading ? (
                                        <LoadingSpinner
                                            color="rgb(14 165 233)"
                                            size={24}
                                        />
                                    ) : (
                                        <VscRefresh size={24} />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex w-full flex-col items-center gap-2 md:max-w-full">
                        <span className="text-sm font-semibold uppercase text-sky-50 md:self-start">
                            Banned members
                        </span>
                        <div className="grid w-full grid-cols-1 gap-2 rounded-md md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                            {bannedMembers.data?.length ? (
                                bannedMembers.data.map((member) => (
                                    <MemberCard
                                        key={member.id}
                                        member={member}
                                        ownerId={ownerId}
                                        onClick={async () => {
                                            await unbanMember.mutateAsync({
                                                chatId,
                                                memberId: member.id,
                                            });
                                        }}
                                    />
                                ))
                            ) : (
                                <p className="rounded-md bg-white p-4 text-center text-sm font-semibold shadow">
                                    No banned members
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(!isModalOpen)}
                        className={
                            dangerButtonStyles +
                            " mb-6 mt-2 disabled:opacity-50"
                        }
                        disabled={deleteChatroom.isLoading}
                    >
                        {deleteChatroom.isLoading ? (
                            <LoadingSpinner color="rgb(2 132 199)" size={28} />
                        ) : (
                            "Delete Chatroom"
                        )}
                    </button>
                    {isModalOpen && (
                        <Portal setState={setIsModalOpen} shouldRoute={false}>
                            <div className="relative flex max-h-full w-full flex-col items-center gap-2 overflow-y-auto rounded-md border-2 border-white bg-white p-4 text-center text-sm hover:border-sky-500 sm:max-w-md">
                                <h1 className="my-4 text-xl font-bold uppercase sm:mt-0">
                                    Are you sure?
                                </h1>
                                <p className="mb-2 max-w-xs text-sm">
                                    You will <strong>NOT</strong> be able to
                                    restore it once the chatroom is deleted!
                                </p>
                                <p className="mb-2 max-w-xs text-sm">
                                    All messages will be deleted!
                                </p>
                                <div className="mt-2 flex w-full items-center justify-center gap-4">
                                    <button
                                        onClick={handleDeleteChatroom}
                                        className="min-w-[100px] rounded-lg border-2 border-black bg-white p-2 font-semibold text-black hover:border-red-600 hover:bg-red-600 hover:text-gray-100 hover:shadow-sm focus:bg-red-600 focus:text-gray-100 focus:shadow-sm focus:shadow-red-600 active:bg-red-600 active:text-gray-100"
                                        disabled={deleteChatroom.isLoading}
                                    >
                                        DELETE
                                    </button>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex h-10 min-w-[100px] items-center justify-center rounded-lg border-2 border-black bg-white p-2 text-sm font-medium shadow-sky-500 enabled:hover:border-sky-500 enabled:hover:bg-sky-500 enabled:hover:text-sky-50 enabled:hover:shadow-sm enabled:focus:border-sky-500 enabled:focus:bg-sky-500 enabled:focus:text-sky-50 enabled:focus:shadow-sm disabled:opacity-50"
                                    >
                                        NO
                                    </button>
                                </div>
                            </div>
                        </Portal>
                    )}
                </div>
            ) : (
                <div className="flex flex-1 items-center justify-center gap-6 md:justify-normal">
                    <button
                        onClick={handleLeaveChatroom}
                        className={dangerButtonStyles + "disabled:opacity-50"}
                        disabled={leaveChatroom.isLoading}
                    >
                        {leaveChatroom.isLoading ? (
                            <LoadingSpinner size={28} />
                        ) : (
                            "Leave Chatroom"
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};
