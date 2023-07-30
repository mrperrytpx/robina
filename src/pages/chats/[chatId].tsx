import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { VscArrowLeft } from "react-icons/vsc";
import { FiSettings, FiUsers } from "react-icons/fi";
import { z } from "zod";
import { useCallback, useEffect, useState } from "react";
import { pusherClient } from "../../lib/pusher";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import {
    TChatroomMessage,
    useGetChatroomQuery,
} from "../../hooks/useGetChatroomQuery";
import { User } from "@prisma/client";
import { ChatroomMembers } from "../../components/ChatroomMembers";
import { ChatroomSettings } from "../../components/ChatroomSettings";
import { ChatroomMessages } from "../../components/ChatroomMessages";
import Link from "next/link";
import { toast } from "react-toastify";
import { TChatroomWIthOwner } from "../api/chatroom/get_owned";
import { Portal } from "../../components/Portal";

const ChatPage = () => {
    const [isMembersActive, setIsMembersActive] = useState(false);
    const [isSettingsActive, setIsSettingsActive] = useState(false);

    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);
    const session = useSession();

    const chatroom = useGetChatroomQuery(chatId);

    const queryClient = useQueryClient();

    useEffect(() => {
        const newUserHandler = async (data: User) => {
            if (!chatId) return;

            toast.success(`${data.username} joined the chatroom!`);
            queryClient.setQueryData(
                ["members", chatId],
                (oldData: User[] | undefined) => {
                    if (!oldData) return [data];
                    return [...oldData, data];
                }
            );
            queryClient.setQueryData(
                ["chat_invites", chatId],
                (oldData: User[] | undefined) => {
                    if (!oldData) return;
                    return oldData.filter((member) => member.id !== data.id);
                }
            );
            queryClient.invalidateQueries(["members", chatId]);
            queryClient.invalidateQueries(["chat_invites", chatId]);
        };

        if (chatroom.data) {
            pusherClient.subscribe(`chat__${chatId}__new-member`);
            pusherClient.bind("new-member", newUserHandler);
        }

        return () => {
            pusherClient.unsubscribe(`chat__${chatId}__new-member`);
            pusherClient.unbind("new-member", newUserHandler);
        };
    }, [chatId, queryClient, chatroom.data]);

    useEffect(() => {
        const removeUserHandler = async (data: {
            id: string;
            chatId: string;
        }) => {
            if (!chatId) return;

            if (data.id === session.data?.user.id) {
                await router.push("/chats");
            } else {
                if (session.data?.user.id !== chatroom.data?.owner_id) {
                    const member = (
                        queryClient.getQueryData(["members", chatId]) as User[]
                    ).find((user) => user.id === data.id);
                    toast.error(`${member?.username} got banned!`);
                }

                queryClient.setQueryData(
                    ["members", chatId],
                    (oldData: User[] | undefined) => {
                        if (!oldData) return;

                        return oldData.filter(
                            (member) => member.id !== data.id
                        );
                    }
                );
                queryClient.setQueryData(
                    ["messages", chatId],
                    (oldData: InfiniteData<TChatroomMessage[]> | undefined) => {
                        if (!oldData) return;
                        return {
                            pageParams: oldData.pageParams,
                            pages: oldData?.pages.map((page) =>
                                page.filter(
                                    (message) => message.author_id !== data.id
                                )
                            ),
                        };
                    }
                );
                queryClient.invalidateQueries(["members", chatId]);
            }
        };
        if (chatroom.data) {
            pusherClient.subscribe(`chat__${chatId}__remove-member`);
            pusherClient.bind("remove-member", removeUserHandler);
        }

        return () => {
            pusherClient.unsubscribe(`chat__${chatId}__remove-member`);
            pusherClient.unbind("remove-member", removeUserHandler);
        };
    }, [chatId, queryClient, router, session.data?.user.id, chatroom.data]);

    useEffect(() => {
        const leaveChatroomHandler = async (data: {
            id: string;
            chatId: string;
        }) => {
            if (!chatId) return;

            if (data.id === session.data?.user.id) {
                await router.push("/chats");
                queryClient.setQueryData(
                    ["chatrooms", session.data.user.id],
                    (oldData: TChatroomWIthOwner[] | undefined) => {
                        if (!oldData) return;
                        return oldData.filter(
                            (chatroom) => chatroom.id !== data.chatId
                        );
                    }
                );

                [
                    "chatroom",
                    "invite",
                    "banned_members",
                    "chat_invites",
                    "members",
                    "messages",
                ].forEach((query) =>
                    queryClient.removeQueries([query, data.chatId])
                );
            } else {
                const member = (
                    queryClient.getQueryData(["members", chatId]) as User[]
                ).find((user) => user.id === data.id);

                toast.warn(`${member?.username} left the chatroom!`);

                queryClient.setQueryData(
                    ["members", chatId],
                    (oldData: User[] | undefined) => {
                        if (!oldData) return;

                        return oldData.filter(
                            (member) => member.id !== data.id
                        );
                    }
                );
            }
        };

        if (chatroom.data) {
            pusherClient.subscribe(`chat__${chatId}__member-leave`);
            pusherClient.bind("member-leave", leaveChatroomHandler);
        }

        return () => {
            pusherClient.unsubscribe(`chat__${chatId}__member-leave`);
            pusherClient.unbind("member-leave", leaveChatroomHandler);
        };
    }, [chatId, queryClient, router, session.data?.user.id, chatroom.data]);

    useEffect(() => {
        const declineInvite = async (data: {
            chatId: string;
            userId: string;
        }) => {
            queryClient.setQueryData(
                ["chat_invites", data.chatId],
                (oldData: User[] | undefined) => {
                    if (!oldData) return;
                    return oldData.filter((user) => user.id !== data.userId);
                }
            );
        };
        if (chatroom.data) {
            pusherClient.subscribe(`chat__${chatId}__decline-invite`);
            pusherClient.bind("decline-invite", declineInvite);
        }

        return () => {
            pusherClient.unsubscribe(`chat__${chatId}__decline-invite`);
            pusherClient.unbind("decline-invite", declineInvite);
        };
    }, [chatId, chatroom.data, queryClient]);

    useEffect(() => {
        const newChatInviteHandler = async (data: User) => {
            if (!chatId) return;

            queryClient.setQueryData(
                ["chat_invites", chatId],
                (oldData: User[] | undefined) => {
                    if (!oldData) return [data];
                    return [...oldData, data];
                }
            );
            queryClient.invalidateQueries(["chat_invites", chatId]);
        };

        if (chatroom.data) {
            pusherClient.subscribe(`chat__${chatId}__chat-invite`);
            pusherClient.bind("chat-invite", newChatInviteHandler);
        }

        return () => {
            pusherClient.unsubscribe(`chat__${chatId}__chat-invite`);
            pusherClient.unbind("chat-invite", newChatInviteHandler);
        };
    }, [chatId, chatroom.data, queryClient]);

    useEffect(() => {
        const deleteRoomHandler = async (data: {
            chatId: string;
            userId: string;
        }) => {
            await router.push("/chats");
            if (data.userId !== session.data?.user.id) {
                toast.error("Owner deleted the chatroom!");
                queryClient.setQueryData(
                    ["chatrooms", session.data?.user.id],
                    (oldData: TChatroomWIthOwner[] | undefined) => {
                        if (!oldData) return;
                        return oldData.filter(
                            (chatroom) => chatroom.id !== data.chatId
                        );
                    }
                );
            } else {
                queryClient.setQueryData(
                    ["owned_chatroom", session.data?.user.id],
                    null
                );
            }

            [
                "chatroom",
                "invite",
                "banned_members",
                "chat_invites",
                "members",
                "messages",
            ].forEach((query) =>
                queryClient.removeQueries([query, data.chatId])
            );
        };

        if (chatroom.data) {
            pusherClient.subscribe(`chat__${chatId}__delete-room`);
            pusherClient.bind("delete-room", deleteRoomHandler);
        }

        return () => {
            pusherClient.unsubscribe(`chat__${chatId}__delete-room`);
            pusherClient.unbind("delete-room", deleteRoomHandler);
        };
    }, [chatId, chatroom.data, queryClient, router, session.data?.user.id]);

    const handleSettings = useCallback(() => {
        setIsSettingsActive((old) => !old);
        setIsMembersActive(false);
    }, []);

    const handleMembers = () => {
        setIsMembersActive((old) => !old);
        setIsSettingsActive(false);
    };

    if (chatroom.isLoading)
        return (
            <div className="flex w-full flex-1 items-center justify-center">
                <div className="flex flex-col gap-4">
                    <LoadingSpinner size={50} color="#0ea5e9" />
                    <span className="text-center font-mono">
                        Loading Chatroom...
                    </span>
                </div>
            </div>
        );

    if (chatroom.isError && chatroom.error instanceof Error) {
        return (
            <div className="mx-auto flex max-h-[calc(100svh-66px)] w-full max-w-screen-lg flex-col items-center justify-center px-8 py-4">
                <div className="flex flex-col items-center gap-4">
                    <span className="text-4xl">😅</span>
                    <p className="text-center text-xl font-medium">
                        {chatroom.error.message}
                    </p>
                </div>
            </div>
        );
    }

    if (!chatroom.data) return null;

    return (
        <div className="flex max-h-[calc(100svh-66px)] w-full flex-row">
            <div className="flex max-h-[calc(100svh-66px)] w-full flex-col">
                <div className="flex h-14 w-full items-center justify-between px-4 shadow sm:hidden">
                    <div className="line-clamp-2 flex items-center gap-2 text-sm font-semibold">
                        <Link
                            href="/chats"
                            className="group px-2 py-1"
                            aria-label="Back to all chats page"
                        >
                            <VscArrowLeft
                                className="fill-black group-hover:fill-sky-500 group-focus:fill-sky-500"
                                size={24}
                            />
                        </Link>
                        <span>{chatroom.data.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="group p-2" onClick={handleSettings}>
                            <FiSettings
                                className=" group-hover:scale-110 group-hover:stroke-sky-500 group-focus:scale-110 group-focus:stroke-sky-500 group-active:scale-110"
                                size={24}
                            />
                        </button>
                        <button className="group p-2" onClick={handleMembers}>
                            <FiUsers
                                className="group-hover:scale-110 group-hover:stroke-sky-500 group-focus:scale-110 group-focus:stroke-sky-500 group-active:scale-110"
                                size={24}
                            />
                        </button>
                    </div>
                </div>
                <div className="line-clamp-2 hidden  px-4 py-1 text-sm font-semibold shadow sm:flex sm:items-center sm:gap-4">
                    <Link
                        href="/chats"
                        className="group px-2 py-1"
                        aria-label="Back to all chats page"
                    >
                        <VscArrowLeft
                            className="fill-black group-hover:fill-sky-500 group-focus:fill-sky-500"
                            size={24}
                        />
                    </Link>
                    <span>{chatroom.data.name}</span>
                </div>
                <ChatroomMessages
                    handleSettings={handleSettings}
                    chatroom={chatroom.data}
                />
                {isSettingsActive && (
                    <Portal shouldRoute={false} setState={setIsSettingsActive}>
                        <ChatroomSettings
                            setIsSettingsActive={setIsSettingsActive}
                            description={chatroom.data.description}
                            ownerId={chatroom.data.owner_id}
                        />
                    </Portal>
                )}

                {isMembersActive && (
                    <ChatroomMembers ownerId={chatroom.data.owner_id} />
                )}
            </div>
            <div className="hidden h-full sm:block">
                <ChatroomMembers ownerId={chatroom.data.owner_id} />
            </div>
        </div>
    );
};

export default ChatPage;

export const getServerSideProps = async (
    ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{ session: Session | null }>> => {
    const session = await getSession(ctx);

    if (!session) {
        return {
            redirect: {
                destination: `/api/auth/signin?callbackUrl=${encodeURIComponent(
                    process.env.NEXTAUTH_URL + ctx.resolvedUrl
                )}`,
                permanent: false,
            },
        };
    }

    if (!session.user.username) {
        return {
            redirect: {
                destination: `/force-username`,
                permanent: false,
            },
        };
    }

    return {
        props: { session },
    };
};
