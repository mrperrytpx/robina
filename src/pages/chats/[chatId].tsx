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
import { useEffect, useMemo, useRef } from "react";
import { pusherClient } from "../../lib/pusher";
import { useQueryClient } from "@tanstack/react-query";
import { chatMessageSchema } from "../../lib/zSchemas";
import type { TChatMessage } from "../../lib/zSchemas";
import { ChatMessage } from "../../components/ChatMessage";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import Image from "next/image";
import DefaultPic from "../../../public/default.png";
import {
    TChatroomMessage,
    useGetChatroomQuery,
} from "../../hooks/useGetChatroomQuery";
import { TChatroomData } from "../api/chatroom/get_chatroom";

const ChatPage = () => {
    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);
    const session = useSession();
    const postMessage = usePostChatMessageMutation();

    const createInvite = useCreateChatroomInviteMutation();

    const chatroom = useGetChatroomQuery(chatId);

    const isOwner = useMemo(
        () =>
            chatroom.data?.members.find(
                (member) => member.id === chatroom.data.owner_id
            ),
        [chatroom.data]
    );

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

    return (
        <div className="mx-auto flex max-h-[calc(100svh-64px)] w-full flex-1">
            <div className="flex w-full flex-1 flex-col">
                <div className="flex w-full items-center justify-between border-b border-black px-6 py-4 shadow-lg sm:hidden">
                    <FiSettings size={24} />
                    <FiUsers size={24} />
                </div>
                <div className="relative flex h-full  items-center justify-center ">
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
                        type="message"
                        placeholder="Message"
                        className="flex-1 p-2 text-black"
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
            <div className="w-60flex-col hidden bg-slate-800 sm:flex">
                <h2 className="p-2 text-xs shadow-md">
                    Members - {chatroom.data?.members.length}
                </h2>
                <div className="flex w-full flex-col overflow-y-auto scrollbar-thin scrollbar-track-black scrollbar-thumb-slate-400">
                    {chatroom.data?.members.map((member) => (
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
                                    fontWeight:
                                        member.id === isOwner?.id ? "bold" : "",
                                }}
                                className="truncate text-sm"
                            >
                                @{member.username}
                            </span>
                        </div>
                    ))}
                </div>
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
