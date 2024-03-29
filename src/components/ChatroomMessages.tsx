import { Fragment, useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { TChatroomMessage } from "../hooks/useGetChatroomQuery";
import { useRouter } from "next/router";
import { z } from "zod";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { pusherClient } from "../lib/pusher";
import { useSession } from "next-auth/react";
import {
    TPageOfMessages,
    useGetChatroomMessagesInfQuery,
} from "../hooks/useGetChatroomMessagesInfQuery";
import { shouldBeNewAuthor } from "../util/shouldBeNewAuthor";
import { Chatroom } from "@prisma/client";
import { LoadingSpinner } from "./LoadingSpinner";
import { SubmitHandler, useForm } from "react-hook-form";
import { FiSettings } from "react-icons/fi";
import { VscSend } from "react-icons/vsc";
import { toast } from "react-toastify";
import {
    IPostMessage,
    usePostChatMessageMutation,
} from "../hooks/usePostChatMessageMutation";
import { TChatMessage, chatMessageSchema } from "../lib/zSchemas";
import { randomString } from "../util/randomString";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInviteUserMutation } from "../hooks/useInviteUserMutation";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

interface IChatroomMessagesProps {
    chatroom: Chatroom;
    handleSettings: () => void;
}

const queue: IPostMessage[] = [];

export const ChatroomMessages = ({
    chatroom,
    handleSettings,
}: IChatroomMessagesProps) => {
    const endRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);
    const queryClient = useQueryClient();
    const session = useSession();

    const isEndIntersecting = useIntersectionObserver(endRef);
    const chatroomMessages = useGetChatroomMessagesInfQuery(chatId);

    const postMessage = usePostChatMessageMutation();
    const inviteUser = useInviteUserMutation();
    const { register, handleSubmit, reset } = useForm<TChatMessage>({
        resolver: zodResolver(chatMessageSchema),
    });

    const onSubmit: SubmitHandler<TChatMessage> = async (data) => {
        if (!chatId || !chatroomMessages.data) return;

        const splitMessage = data.message.split(" ");
        if (splitMessage[0].toLowerCase() === "/invite") {
            reset();

            if (session.data?.user.id !== chatroom.owner_id) return;

            const response = await inviteUser.mutateAsync({
                chatId,
                username: splitMessage[1],
            });

            if (!response?.ok) {
                const error = await response?.text();
                toast.error(error);
            }
            return;
        }

        if (queue.length >= 5) return;

        endRef.current?.scrollIntoView({ behavior: "instant" });

        const messageData: IPostMessage = {
            ...data,
            chatId,
            fakeId: randomString(10),
        };

        queue.push(messageData);
        reset();

        if (!session.data?.user) return;

        await queryClient.cancelQueries(["messages", chatId]);

        const newMessage: TChatroomMessage = {
            author: {
                ...session.data.user,
                created_at: new Date(),
                emailVerified: null,
            },
            author_id: session.data.user.id,
            chatroom_id: chatId,
            content: data.message,
            created_at: new Date(),
            id: messageData.fakeId,
        };

        queryClient.setQueryData(
            ["messages", chatId],
            (oldData: InfiniteData<TPageOfMessages> | undefined) => {
                if (!oldData)
                    return {
                        pageParams: [0],
                        pages: [{ hasMore: false, messages: [] }],
                    };

                const newData = oldData.pages.map((page, pageIdx) => {
                    if (pageIdx === oldData.pages.length - 1) {
                        return {
                            ...page,
                            messages: [...page.messages, newMessage],
                        };
                    } else {
                        return page;
                    }
                });

                return {
                    pages: newData,
                    pageParams: oldData.pageParams || [0],
                };
            }
        );

        while (queue.length > 0 && !postMessage.isLoading) {
            const message = queue.shift();
            if (!message) return;

            await postMessage.mutateAsync(message);
        }
        return;
    };

    useEffect(() => {
        if (isEndIntersecting) {
            endRef.current?.scrollIntoView({ behavior: "instant" });
        }
    }, [isEndIntersecting, chatroomMessages]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "instant" });
    }, []);

    useEffect(() => {
        const deleteMessageHandler = async (data: {
            remover_id: string;
            id: string;
        }) => {
            if (!chatId) return;

            if (session.data?.user.id === data.remover_id) return;

            queryClient.setQueryData(
                ["messages", chatId],
                (oldData: InfiniteData<TPageOfMessages> | undefined) => {
                    if (!oldData) return;

                    const newData = oldData.pages.map((page) => ({
                        ...page,
                        messages: page.messages.filter(
                            (msg) => msg.id !== data.id
                        ),
                    }));

                    return {
                        pages: newData,
                        pageParams: oldData.pageParams || [0],
                    };
                }
            );
        };

        pusherClient.subscribe(`chat__${chatId}__delete-message`);
        pusherClient.bind("delete-message", deleteMessageHandler);

        return () => {
            pusherClient.unsubscribe(`chat__${chatId}__delete-message`);
            pusherClient.unbind("delete-message", deleteMessageHandler);
        };
    }, [chatId, queryClient, session.data?.user.id]);

    useEffect(() => {
        const newMessageHandler = async (
            data: TChatroomMessage & { fakeId: string }
        ) => {
            if (!chatId) return;

            if (data.author_id === session.data?.user.id) {
                queryClient.setQueryData(
                    ["messages", chatId],
                    (oldData: InfiniteData<TPageOfMessages> | undefined) => {
                        oldData?.pages[
                            oldData?.pages.length - 1 ?? 0
                        ].messages.map((msg) => {
                            if (msg.id === data.fakeId) {
                                msg.id = data.id;
                            }
                            return msg;
                        });

                        return oldData;
                    }
                );
                return;
            } else {
                queryClient.setQueryData(
                    ["messages", chatId],
                    (oldData: InfiniteData<TPageOfMessages> | undefined) => {
                        if (!oldData)
                            return {
                                pageParams: [0],
                                pages: [{ hasMore: false, messages: [] }],
                            };

                        const newData = oldData.pages.map((page, pageIdx) => {
                            if (pageIdx === oldData.pages.length - 1) {
                                return {
                                    ...page,
                                    messages: [...page.messages, data],
                                };
                            } else {
                                return page;
                            }
                        });

                        return {
                            pages: newData,
                            pageParams: oldData.pageParams || [0],
                        };
                    }
                );
            }

            queryClient.setQueryData(
                ["messages", chatId],
                (oldData: InfiniteData<TPageOfMessages> | undefined) => {
                    oldData?.pages[
                        oldData?.pages.length - 1 ?? 0
                    ].messages.sort((a, b) => {
                        if (a.id.length === b.id.length) return 0;
                        if (a.id.length > b.id.length) return -1;
                        return 1;
                    });

                    return oldData;
                }
            );
        };

        pusherClient.subscribe(`chat__${chatId}__new-message`);
        pusherClient.bind("new-message", newMessageHandler);

        return () => {
            pusherClient.unsubscribe(`chat__${chatId}__new-message`);
            pusherClient.unbind("new-message", newMessageHandler);
        };
    }, [chatId, queryClient, session.data?.user.id]);

    if (chatroomMessages.isError && chatroomMessages.error instanceof Error) {
        return (
            <div
                aria-label="Error state"
                className="mx-auto flex max-h-[calc(100svh-64px)] w-full max-w-screen-lg flex-1 flex-col items-center justify-center px-8 py-4"
            >
                <div className="flex flex-col items-center gap-4">
                    <span className="text-4xl">😅</span>
                    <p className="text-center text-xl font-medium">
                        {chatroomMessages.error.message}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-1 flex-col overflow-y-auto p-2 px-4 scrollbar-thin scrollbar-track-glacier-900 scrollbar-thumb-glacier-200">
                {chatroomMessages.isLoading ? (
                    <div className="mt-auto flex w-full items-center justify-center">
                        <LoadingSpinner size={32} color="#337387" />
                    </div>
                ) : chatroomMessages.isFetchingPreviousPage ? (
                    <LoadingSpinner size={32} color="#337387" />
                ) : (
                    chatroomMessages.hasPreviousPage && (
                        <button
                            className="disabled:opacity:50 w-full bg-glacier-200 p-1 font-semibold"
                            onClick={() => chatroomMessages.fetchPreviousPage()}
                            disabled={!chatroomMessages.hasPreviousPage}
                        >
                            Load more messages
                        </button>
                    )
                )}

                {chatroomMessages.data?.pages.map((page, i) => (
                    <Fragment key={i}>
                        {page.messages.map((message, msgIdx) => {
                            const isSameAuthor = shouldBeNewAuthor(
                                page.messages,
                                msgIdx,
                                message
                            );

                            return (
                                <ChatMessage
                                    isSameAuthor={isSameAuthor}
                                    message={message}
                                    key={message.id}
                                    ownerId={chatroom.owner_id}
                                />
                            );
                        })}
                    </Fragment>
                ))}
                <div ref={endRef} />
            </div>

            <div className="flex h-14 items-center gap-2 px-3">
                <button
                    className="group hidden rounded-full border-2 border-glacier-900 bg-white p-2 hover:border-glacier-600 hover:bg-glacier-600 focus:border-glacier-600 focus:bg-glacier-600 sm:inline-block"
                    aria-label="Toggle chatroom settings modal."
                    onClick={handleSettings}
                >
                    <FiSettings className="h-5 w-5 stroke-glacier-900 group-hover:stroke-glacier-50 group-focus:stroke-glacier-50 group-active:stroke-glacier-50" />
                </button>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex w-full items-center justify-between gap-2"
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
                        maxLength={150}
                        minLength={1}
                        disabled={!chatroomMessages.data}
                        className="h-10 w-full rounded-md border-2 border-glacier-900 p-2 text-sm font-medium hover:border-glacier-400 focus:border-glacier-400 focus:outline-glacier-400 disabled:border-glacier-200 disabled:bg-glacier-200 disabled:text-glacier-700 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        className="group rounded-full border-2 border-glacier-900 bg-white p-2 transition-all duration-75 hover:border-glacier-600 hover:bg-glacier-600 focus:border-glacier-600 focus:bg-glacier-600 sm:inline-block"
                        aria-label="Send message."
                        disabled={!chatroomMessages.data?.pages}
                    >
                        <VscSend className="h-5 w-5 fill-glacier-900 group-hover:fill-glacier-50 group-focus:fill-glacier-50 group-active:fill-glacier-50" />
                    </button>
                </form>
            </div>
        </>
    );
};
