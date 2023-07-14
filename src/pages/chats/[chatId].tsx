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
import { useCreateChatroomInviteMutation } from "../../hooks/useCreateChatroomInviteMutation";
import { useEffect, useMemo, useRef, useState } from "react";
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

const ChatPage = () => {
    const [isMembersActive, setIsMembersActive] = useState(false);
    const [isSettingsActive, setIsSettingsActive] = useState(false);

    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);
    const session = useSession();
    const postMessage = usePostChatMessageMutation();

    const createInvite = useCreateChatroomInviteMutation();

    const chatroom = useGetChatroomQuery(chatId);

    const endRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<HTMLDivElement>(null);

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
                // This is the weirdest shit ever
                // Spread operator tripping the type
                // then only the first return needs to be casted to fix it ???????????
                // ????????????????????????????????????????????????
                (oldData: TChatroomData | undefined) => {
                    if (!oldData?.messages) {
                        return {
                            ...oldData,
                            messages: [data],
                        } as TChatroomData;
                    } else {
                        return {
                            ...oldData,
                            messages: [...oldData.messages, data],
                        };
                    }
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
        endRef.current?.scrollIntoView({ behavior: "instant" });
    }, [chatroom.data?.messages]);

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
        <div className="mx-auto flex max-h-[100svh] w-full flex-1">
            <div className="flex w-full flex-1 flex-col">
                <div className="flex w-full items-center justify-between border-b border-black px-6 py-4 shadow-lg sm:hidden">
                    <FiSettings size={24} onClick={handleSettings} />
                    <FiUsers size={24} onClick={handleMembers} />
                </div>
                <div className="relative flex flex-1 flex-col">
                    <div className="relative flex h-full items-center justify-center ">
                        {chatroom.isLoading ? (
                            <div className="flex flex-col items-center gap-4">
                                <LoadingSpinner />
                                Loading messages...
                            </div>
                        ) : chatroom.data?.messages.length ? (
                            <div
                                ref={chatRef}
                                className="absolute inset-0 w-full flex-1 overflow-clip overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-track-black scrollbar-thumb-slate-400"
                            >
                                {chatroom.data?.messages.map((message, i) => (
                                    <ChatMessage
                                        isDifferentAuthor={
                                            i > 0 &&
                                            message.author_id ===
                                                chatroom.data?.messages[i - 1]
                                                    .author_id
                                        }
                                        message={message}
                                        key={message.id}
                                        ownerId={chatroom.data.owner_id}
                                    />
                                ))}
                                <div ref={endRef} />
                            </div>
                        ) : (
                            <div>No messages</div>
                        )}
                    </div>
                    <form
                        className="my-4 flex min-h-[48px] w-[calc(100%-48px)] items-center justify-between gap-2 self-end px-4 shadow-lg"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <label
                            aria-hidden="true"
                            aria-label={`Chatroom with id ${chatId}`}
                            htmlFor="message"
                            className="hidden"
                        />
                        <input
                            {...register("message")}
                            name="message"
                            id="message"
                            type="text"
                            placeholder="Message"
                            className="min-w-0 flex-1 p-2 text-black"
                        />
                        <button
                            type="submit"
                            className="rounded-full bg-white p-2 shadow-md"
                            aria-label="Send message"
                        >
                            <VscSend fill="black" size={20} />
                        </button>
                    </form>
                    {isMembersActive && (
                        <div className="absolute inset-0 h-full w-full bg-gray-900">
                            <ChatroomMembers
                                members={chatroom.data.members}
                                ownerId={chatroom.data.owner_id}
                            />
                        </div>
                    )}
                    {isSettingsActive && (
                        <div className="absolute inset-0 h-full w-full bg-gray-900">
                            <button
                                className="shadowm-md rounded-lg bg-white p-2 text-black"
                                onClick={async () => {
                                    await createInvite.mutateAsync({ chatId });
                                }}
                            >
                                Generate invite link
                            </button>
                            {createInvite.data && (
                                <div>{createInvite.data.value}</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="hidden sm:block">
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
