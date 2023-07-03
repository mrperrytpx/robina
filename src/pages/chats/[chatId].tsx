import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { VscSend } from "react-icons/vsc";
import { useGetOwnedChatroomtroomsQuery } from "../../hooks/useGetOwnedChatroomtroomsQuery";
import { useDeleteOwnedChatroomMutation } from "../../hooks/useDeleteOwnedChatroomMutation";
import { z } from "zod";
import { usePostChatMessageMutation } from "../../hooks/usePostChatMessageMutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import {
    TChatroomMessage,
    useGetChatroomMessagesQuery,
} from "../../hooks/useGetChatroomMessagesQuery";
import { useUpdateWhitelistMutation } from "../../hooks/useUpdateWhitelistMutation";
import { useCreateChatroomInviteMutation } from "../../hooks/useCreateChatroomInviteMutation";
import { useEffect, useRef } from "react";
import { pusherClient } from "../../lib/pusher";
import { useQueryClient } from "@tanstack/react-query";
import { chatMessageSchema } from "../../lib/zSchemas";
import type { TChatMessage } from "../../lib/zSchemas";
import { ChatMessage } from "../../components/ChatMessage";
import { LoadingSpinner } from "../../components/LoadingSpinner";

const ChatPage = () => {
    const router = useRouter();
    const session = useSession();
    const ownedChatroom = useGetOwnedChatroomtroomsQuery();
    const deleteOwnedChatroom = useDeleteOwnedChatroomMutation();
    const postMessage = usePostChatMessageMutation();
    const updateWhitelist = useUpdateWhitelistMutation();
    const createInvite = useCreateChatroomInviteMutation();

    const chatId = z.string().parse(router.query.chatId);

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

    const isOwner = session.data?.user.id === ownedChatroom.data?.owner_id;

    const chatRef = useRef<HTMLDivElement>(null);

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

    const handleDelete = async () => {
        if (!chatId) return;

        const response = await deleteOwnedChatroom.mutateAsync({
            chatId,
        });

        if (!response.ok) return;

        router.push("/chats");
    };

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
            <div className="relative anchor h-full">
                {chatroomMessages.data && (
                    <div
                        ref={chatRef}
                        className="anchor absolute inset-0 w-full flex-1 overflow-clip overflow-y-auto  py-2 pr-1"
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
                    </div>
                )}
            </div>
            <form
                className="mt-4 flex min-h-[48px] w-full items-center justify-between gap-2 shadow-lg"
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
