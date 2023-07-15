import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { VscSend } from "react-icons/vsc";
import { FiSettings, FiUsers } from "react-icons/fi";
import { z } from "zod";
import { usePostChatMessageMutation } from "../../hooks/usePostChatMessageMutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { pusherClient } from "../../lib/pusher";
import { useQueryClient } from "@tanstack/react-query";
import { chatMessageSchema } from "../../lib/zSchemas";
import type { TChatMessage } from "../../lib/zSchemas";
import { ChatMessage } from "../../components/ChatMessage";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import {
    TChatroomMessage,
    useGetChatroomQuery,
} from "../../hooks/useGetChatroomQuery";
import { TChatroomData } from "../api/chatroom/get_chatroom";
import { User } from "@prisma/client";
import { ChatroomMembers } from "../../components/ChatroomMembers";
import { ChatroomSettings } from "../../components/ChatroomSettings";
import { ChatroomMessages } from "../../components/ChatroomMessages";

const ChatPage = () => {
    const [isMembersActive, setIsMembersActive] = useState(false);
    const [isSettingsActive, setIsSettingsActive] = useState(false);

    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);
    const session = useSession();
    const postMessage = usePostChatMessageMutation();

    const chatroom = useGetChatroomQuery(chatId);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        reset,
    } = useForm<TChatMessage>({
        resolver: zodResolver(chatMessageSchema),
    });

    const queryClient = useQueryClient();

    useEffect(() => {
        const newMessageHandler = async (data: TChatroomMessage) => {
            if (!chatId) return;
            queryClient.setQueryData(
                ["chatroom", chatId],
                (oldData: TChatroomData | undefined) => {
                    const newData: TChatroomData = JSON.parse(
                        JSON.stringify(oldData)
                    );
                    newData.messages = [...newData.messages, data];
                    return newData;
                }
            );
        };

        pusherClient.subscribe(`chat__${chatId}__new-message`);
        pusherClient.bind("new-message", newMessageHandler);

        return () => {
            pusherClient.unsubscribe(`chat__${chatId}__new-message`);
            pusherClient.unbind("new-message", newMessageHandler);
        };
    }, [chatId, queryClient, chatroom.data?.messages]);

    useEffect(() => {
        const newUserHandler = async (data: User) => {
            if (!chatId) return;
            queryClient.setQueryData(
                ["chatroom", chatId],
                (oldData: TChatroomData | undefined) => {
                    if (!oldData?.members) {
                        return {
                            ...oldData,
                            members: [data],
                        } as TChatroomData;
                    } else {
                        return {
                            ...oldData,
                            members: [...oldData.members, data],
                        };
                    }
                }
            );
        };

        pusherClient.subscribe(`chat__${chatId}__new-member`);
        pusherClient.bind("new-member", newUserHandler);

        return () => {
            pusherClient.unsubscribe(`chat__${chatId}__new-member`);
            pusherClient.unbind("new-member", newUserHandler);
        };
    }, [chatId, queryClient, chatroom.data?.members]);

    useEffect(() => {
        const removeUserHandler = async (data: { id: string }) => {
            if (!chatId) return;

            if (data.id === session.data?.user.id) {
                router.push("/chats");
            } else {
                queryClient.setQueryData(
                    ["chatroom", chatId],
                    (oldData: TChatroomData | undefined) => {
                        if (!oldData?.members) return;

                        return {
                            ...oldData,
                            messages: oldData.messages.filter(
                                (message) => message.author_id !== data.id
                            ),
                            members: oldData.members.filter(
                                (member) => member.id !== data.id
                            ),
                        };
                    }
                );
            }
        };

        pusherClient.subscribe(`chat__${chatId}__remove-member`);
        pusherClient.bind("remove-member", removeUserHandler);

        return () => {
            pusherClient.unsubscribe(`chat__${chatId}__remove-member`);
            pusherClient.unbind("remove-member", removeUserHandler);
        };
    }, [chatId, queryClient, chatroom.data, router, session.data?.user.id]);

    useEffect(() => {
        const leaveChatroomHandler = async (data: { id: string }) => {
            if (!chatId) return;

            if (data.id === session.data?.user.id) {
                router.push("/chats");
            } else {
                queryClient.setQueryData(
                    ["chatroom", chatId],
                    (oldData: TChatroomData | undefined) => {
                        if (!oldData?.members) return;

                        return {
                            ...oldData,
                            messages: oldData.messages.filter(
                                (message) => message.author_id !== data.id
                            ),
                            members: oldData.members.filter(
                                (member) => member.id !== data.id
                            ),
                        };
                    }
                );
            }
        };

        pusherClient.subscribe(`chat__${chatId}__member-leave`);
        pusherClient.bind("member-leave", leaveChatroomHandler);

        return () => {
            pusherClient.unsubscribe(`chat__${chatId}__member-leave`);
            pusherClient.unbind("member-leave", leaveChatroomHandler);
        };
    }, [chatId, queryClient, chatroom.data, router, session.data?.user.id]);

    const onSubmit: SubmitHandler<TChatMessage> = async (data) => {
        if (!chatId) return;
        reset();

        const response = await postMessage.mutateAsync({
            ...data,
            chatId,
        });

        if (!response?.ok) {
            const error = await response?.text();
            setError("root", { message: error || "Server Error" });
            return;
        }
    };

    const handleSettings = () => {
        setIsSettingsActive(!isSettingsActive);
        setIsMembersActive(false);
    };

    const handleMembers = () => {
        setIsMembersActive(!isMembersActive);
        setIsSettingsActive(false);
    };

    if (chatroom.isLoading) return <LoadingSpinner />;

    if (!chatroom.data) {
        return <div>You&apos;re not a part of this chatroom :)</div>;
    }

    return (
        <div className="flex max-h-[calc(100svh-64px)] w-full flex-row">
            <div className="flex max-h-[calc(100svh-64px)] w-full flex-col">
                <div className="flex h-14 w-full items-center justify-between px-4 shadow-lg sm:hidden">
                    <button onClick={handleSettings}>
                        <FiSettings
                            className="cursor-pointer hover:scale-110 focus:scale-110 active:scale-110"
                            size={24}
                        />
                    </button>
                    <button onClick={handleMembers}>
                        <FiUsers
                            className="cursor-pointer hover:scale-110 focus:scale-110 active:scale-110"
                            size={24}
                        />
                    </button>
                </div>
                <ChatroomMessages />
                <div className="flex h-14 items-center gap-3  px-4">
                    <button
                        type="submit"
                        className="hidden rounded-full bg-white p-2 shadow-md sm:inline-block"
                        aria-label="Send message"
                        onClick={handleSettings}
                    >
                        <FiSettings size={20} stroke="black" />
                    </button>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex w-full items-center justify-between gap-3"
                    >
                        <label
                            aria-hidden="true"
                            aria-label={`Chatroom with id ${chatId}`}
                            htmlFor="message"
                            className="hidden"
                        />
                        <input
                            {...register("message")}
                            autoComplete="off"
                            name="message"
                            id="message"
                            type="text"
                            placeholder="Message"
                            className="h-full w-full min-w-0 flex-1 rounded-3xl p-2 pl-3 text-sm text-black"
                        />
                        <button
                            type="submit"
                            className="rounded-full bg-white p-2 shadow-md"
                            aria-label="Send message"
                        >
                            <VscSend fill="black" size={20} />
                        </button>
                    </form>
                </div>
                {isSettingsActive && (
                    <ChatroomSettings ownerId={chatroom.data.owner_id} />
                )}
                {isMembersActive && (
                    <ChatroomMembers
                        members={chatroom.data.members}
                        ownerId={chatroom.data.owner_id}
                    />
                )}
            </div>
            <div className="hidden h-full sm:block">
                <ChatroomMembers
                    members={chatroom.data.members}
                    ownerId={chatroom.data.owner_id}
                />
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
                destination: `/profile/username`,
                permanent: false,
            },
        };
    }

    return {
        props: { session },
    };
};
