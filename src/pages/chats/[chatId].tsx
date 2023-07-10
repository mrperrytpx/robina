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
import {
    TChatroomMessage,
    useGetChatroomMessagesQuery,
} from "../../hooks/useGetChatroomMessagesQuery";
import { useCreateChatroomInviteMutation } from "../../hooks/useCreateChatroomInviteMutation";
import { useEffect, useMemo, useRef, useState } from "react";
import { pusherClient } from "../../lib/pusher";
import { useQueryClient } from "@tanstack/react-query";
import { chatMessageSchema } from "../../lib/zSchemas";
import type { TChatMessage } from "../../lib/zSchemas";
import { ChatMessage } from "../../components/ChatMessage";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useGetChatroomMembersQuery } from "../../hooks/useGetChatroomMembersQuery";
import { Portal } from "../../components/Portal";

const ChatPage = () => {
    const [isMembersOpen, setIsMembersOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);
    const session = useSession();
    const postMessage = usePostChatMessageMutation();

    const createInvite = useCreateChatroomInviteMutation();
    const chatroomMembers = useGetChatroomMembersQuery(chatId);

    const isOwner = useMemo(
        () =>
            chatroomMembers.data?.find(
                (member) => member.id === session.data?.user.id
            ),
        [chatroomMembers.data, session.data?.user.id]
    );

    const endRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<HTMLDivElement>(null);

    const chatroomMessages = useGetChatroomMessagesQuery(chatId);

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
                ["messages", chatId],
                (oldData: typeof chatroomMessages.data) => {
                    if (!oldData?.length) {
                        return [data];
                    } else {
                        return [...oldData, data];
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
    }, [chatId, queryClient, chatroomMessages]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatroomMessages.data]);

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
        <div className="mx-auto flex w-full max-w-screen-md flex-1 flex-col">
            <div>{!!isOwner ? "Owner" : "not owner"}</div>
            <div className="flex w-full items-center justify-between border-b border-black px-6 py-4 shadow-lg">
                <FiSettings size={24} />
                <FiUsers size={24} />
            </div>
            <div className="anchor relative flex h-full items-center justify-center">
                {chatroomMessages.isLoading ? (
                    <div className="flex flex-col items-center gap-4">
                        <LoadingSpinner />
                        Loading messages...
                    </div>
                ) : chatroomMessages.data?.length ? (
                    <div
                        ref={chatRef}
                        className="absolute inset-0 w-full flex-1 overflow-clip overflow-y-auto px-4 py-2"
                    >
                        {chatroomMessages.data.map((message, i) => (
                            <ChatMessage
                                isDifferentAuthor={
                                    i > 0 &&
                                    message.author_id ===
                                        chatroomMessages.data?.[i - 1].author_id
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
                className="my-4 flex min-h-[48px] w-full items-center justify-between gap-2 px-4 shadow-lg"
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
            {/* {isMembersOpen && (
                <Portal>
                    <div className="relative flex max-h-full max-w-screen-md flex-col items-center gap-4 overflow-y-auto rounded-md border-2 border-slate-500 bg-black p-4 text-slate-100 hover:border-slate-200">
                        {!chatroomMembers.data ? (
                            <LoadingSpinner size={50} />
                        ) : (
                            <div>yo</div>
                        )}
                    </div>
                </Portal>
            )}
            {isSettingsOpen && (
                <Portal>
                    <div className="relative flex max-h-full max-w-screen-md flex-col items-center gap-4 overflow-y-auto rounded-md border-2 border-slate-500 bg-black p-4 text-slate-100 hover:border-slate-200">
                        <div>yo settings</div>
                    </div>
                </Portal>
            )} */}
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
