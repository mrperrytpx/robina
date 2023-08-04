import { useRouter } from "next/router";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useDeleteOwnedChatroomMutation } from "../hooks/useDeleteOwnedChatroomMutation";
import { useLeaveChatroomMutation } from "../hooks/useLeaveChatroomMutation";
import { useGetChatroomInviteQuery } from "../hooks/useGetChatroomInviteQuery";
import { VscCopy, VscCheck, VscRefresh, VscChromeClose } from "react-icons/vsc";
import { Dispatch, SetStateAction, useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { usePatchChatroomInviteMutation } from "../hooks/usePatchChatroomInviteMutation";
import { useGetBannedChatroomMembersQuery } from "../hooks/useGetBannedChatroomMembersQuery";
import { useUnbanChatroomMemberMutation } from "../hooks/useUnbanChatroomMemberMutation";
import { MemberCard } from "./MemberCard";
import { Portal } from "./Portal";
import { toast } from "react-toastify";

interface IChatroomSettingsProps {
    ownerId: string;
    description: string;
    setIsSettingsActive: Dispatch<SetStateAction<boolean>>;
}

export const ChatroomSettings = ({
    ownerId,
    description,
    setIsSettingsActive,
}: IChatroomSettingsProps) => {
    const [copied, setCopied] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);
    const session = useSession();

    const getInvite = useGetChatroomInviteQuery(
        chatId,
        ownerId === session.data?.user.id
    );
    const patchInvite = usePatchChatroomInviteMutation();

    const bannedMembers = useGetBannedChatroomMembersQuery(
        chatId,
        ownerId === session.data?.user.id
    );
    const unbanMember = useUnbanChatroomMemberMutation();

    const deleteChatroom = useDeleteOwnedChatroomMutation();
    const leaveChatroom = useLeaveChatroomMutation();

    const dangerButtonStyles =
        "w-full rounded-lg bg-white p-2 font-semibold text-black shadow hover:bg-red-600 hover:text-gray-100 focus:bg-red-600 focus:text-gray-100 active:bg-red-600 active:text-gray-100";

    const handleDeleteChatroom = async () => {
        setIsModalOpen(false);
        const { response } = await deleteChatroom.mutateAsync({ chatId });

        if (!response.ok) {
            const error = await response.text();
            toast.error(error);
            return;
        }
    };

    const handleLeaveChatroom = async () => {
        const { response } = await leaveChatroom.mutateAsync({ chatId });

        if (!response.ok) {
            const error = await response.text();
            toast.error(error);
            return;
        }

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
        <div className="scrollbar-track-glacier-900scrollbar-thumb-glacier-200 w-full flex-1 overflow-y-auto bg-glacier-600 scrollbar-thin sm:mx-auto sm:my-20 sm:max-h-[50svh] sm:max-w-lg sm:rounded-xl sm:bg-opacity-100">
            {isModalOpen ? (
                <Portal
                    isInModal={true}
                    setState={setIsModalOpen}
                    shouldRoute={false}
                >
                    <div className="relative flex w-full flex-1 flex-col items-center gap-2 overflow-y-auto rounded-md border-2 border-white bg-white p-4 text-center text-sm hover:border-glacier-600 sm:max-w-md">
                        <h1 className="my-4 text-xl font-bold uppercase sm:mt-0">
                            Are you sure?
                        </h1>
                        <p className="mb-2 max-w-xs text-sm">
                            You will{" "}
                            <strong className="text-base uppercase text-red-600 underline">
                                not
                            </strong>{" "}
                            be able to restore it once the chatroom is deleted!
                        </p>
                        <p className="mb-2 max-w-xs text-sm">
                            <strong className="text-base uppercase text-red-600 underline">
                                all
                            </strong>{" "}
                            messages will be deleted!
                        </p>
                        <div className="mt-2 flex w-full items-center justify-center gap-4">
                            <button
                                onClick={handleDeleteChatroom}
                                className="min-w-[100px] select-none rounded-lg border-2 border-black bg-white p-2 font-semibold uppercase text-black hover:border-red-600 hover:bg-red-600 hover:text-gray-100 hover:shadow-sm focus:bg-red-600 focus:text-gray-100 focus:shadow-sm focus:shadow-red-600 active:bg-red-600 active:text-gray-100"
                                disabled={deleteChatroom.isLoading}
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="h-10 min-w-[100px] select-none items-center justify-center rounded-lg border-2 border-black bg-white p-2 text-sm font-medium uppercase shadow-glacier-600 enabled:hover:border-glacier-600 enabled:hover:bg-glacier-600 enabled:hover:text-white enabled:hover:shadow-sm enabled:focus:border-glacier-600 enabled:focus:bg-glacier-600 enabled:focus:text-white enabled:focus:shadow-sm disabled:opacity-50"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </Portal>
            ) : (
                <div className="w-full p-4">
                    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4">
                        <button
                            onClick={() => setIsSettingsActive(false)}
                            aria-label="Close settings"
                            className="group flex items-center gap-1 self-start rounded-full border-2 border-white bg-white p-1 text-sm font-semibold uppercase antialiased shadow  hover:border-black hover:shadow-glacier-600 focus:border-black focus:shadow-glacier-600"
                        >
                            <VscChromeClose
                                className="group-hover:fill-glacier-600 group-focus:fill-glacier-600"
                                size={28}
                            />
                        </button>
                        <div className="w-full space-y-2">
                            <h3 className="block text-sm font-bold uppercase text-white">
                                Chatroom description:
                            </h3>
                            <p className="rounded-md bg-white p-2 text-center text-sm shadow">
                                {description}
                            </p>
                        </div>
                        {ownerId === session.data?.user.id ? (
                            <div className="flex w-full flex-col items-center gap-4">
                                <div className="flex w-full flex-wrap items-center gap-2 md:justify-normal">
                                    <span className="text-sm font-semibold uppercase text-white">
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
                                                aria-label="Copy invite string to clipboard."
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
                                                aria-label="Get new invite string."
                                                onClick={async () => {
                                                    await patchInvite.mutateAsync(
                                                        {
                                                            chatId,
                                                        }
                                                    );
                                                    setCopied(false);
                                                }}
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
                                    {getInvite.isError &&
                                        getInvite.error instanceof Error && (
                                            <span className="text-sm font-semibold uppercase text-white">
                                                {getInvite.error.message}
                                            </span>
                                        )}
                                </div>

                                <div className="flex w-full flex-col gap-2">
                                    <span className="text-sm font-semibold uppercase text-white">
                                        Banned members
                                    </span>
                                    <div
                                        className={`grid w-full items-center gap-2 rounded-md ${
                                            (bannedMembers.data?.length || 0) >=
                                            1
                                                ? "grid-cols-2"
                                                : ""
                                        }`}
                                    >
                                        {bannedMembers.isLoading ? (
                                            <div className="w-full rounded-md bg-white px-2 py-2 text-center text-sm font-semibold shadow">
                                                <LoadingSpinner
                                                    color="rgb(14 165 233)"
                                                    size={28}
                                                />
                                            </div>
                                        ) : bannedMembers.data?.length ? (
                                            bannedMembers.data.map((member) => (
                                                <MemberCard
                                                    key={member.id}
                                                    member={member}
                                                    ownerId={ownerId}
                                                    onClick={async () => {
                                                        await unbanMember.mutateAsync(
                                                            {
                                                                chatId,
                                                                memberId:
                                                                    member.id,
                                                            }
                                                        );
                                                    }}
                                                />
                                            ))
                                        ) : (
                                            <p className="w-full rounded-md bg-white px-4 py-3 text-center text-sm font-semibold shadow">
                                                No banned members
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsModalOpen(!isModalOpen)}
                                    className={
                                        dangerButtonStyles +
                                        "group select-none disabled:opacity-50"
                                    }
                                    disabled={deleteChatroom.isLoading}
                                    aria-label="Delete the chatroom."
                                >
                                    {deleteChatroom.isLoading ? (
                                        <LoadingSpinner
                                            color="rgb(2 132 199)"
                                            size={28}
                                        />
                                    ) : (
                                        "Delete Chatroom"
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="mt-auto flex w-full justify-center gap-6">
                                <button
                                    onClick={handleLeaveChatroom}
                                    className={
                                        dangerButtonStyles +
                                        "select-none disabled:opacity-50"
                                    }
                                    aria-label="Leave the chatroom."
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
                </div>
            )}
        </div>
    );
};
