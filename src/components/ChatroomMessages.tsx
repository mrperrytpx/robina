import { Fragment, RefObject, useEffect, useRef, useState } from "react";
import { ChatMessage } from "./ChatMessage";
import { TChatroomMessage } from "../hooks/useGetChatroomQuery";
import { useRouter } from "next/router";
import { z } from "zod";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { pusherClient } from "../lib/pusher";
import { useSession } from "next-auth/react";
import { useGetChatroomMessagesInfQuery } from "../hooks/useGetChatroomMessagesInfQuery";
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

type TIntersectionObserverOptions = {
    root?: Element | null;
    rootMargin?: string;
    threshold?: number | number[];
};

export const useIntersectionObserver = (
    ref: RefObject<HTMLDivElement>,
    options: TIntersectionObserverOptions
) => {
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const current = ref.current as HTMLDivElement;

        const hasIOSupport = !!window.IntersectionObserver;

        if (!hasIOSupport || !current) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        observer.observe(current);

        return () => {
            setIsIntersecting(false);
            observer.disconnect();
        };
    }, [ref, options]);

    return isIntersecting;
};

interface IChatroomMessagesProps {
    chatroom: Chatroom;
    handleSettings: () => void;
}

export const ChatroomMessages = ({
    chatroom,
    handleSettings,
}: IChatroomMessagesProps) => {
    const endRef = useRef<HTMLDivElement>(null);
    const startRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);
    const queryClient = useQueryClient();
    const session = useSession();

    const chatroomMessages = useGetChatroomMessagesInfQuery(chatId);

    const isStartIntersecting = useIntersectionObserver(startRef, {});

    const postMessage = usePostChatMessageMutation();
    const inviteUser = useInviteUserMutation();
    const { register, handleSubmit, reset } = useForm<TChatMessage>({
        resolver: zodResolver(chatMessageSchema),
    });

    const onSubmit: SubmitHandler<TChatMessage> = async (data) => {
        if (!chatId || !chatroomMessages.data) return;
        reset();

        const splitMessage = data.message.split(" ");
        if (splitMessage[0].toLowerCase() === "/invite") {
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

        const messageData: IPostMessage = {
            ...data,
            chatId,
            fakeId: randomString(10),
        };

        const response = await postMessage.mutateAsync({ ...messageData });

        if (!response.ok) {
            const error = await response.text();
            toast.error(error);
        }
    };

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "instant" });
    }, [chatroomMessages.data]);

    useEffect(() => {
        if (chatroomMessages.hasPreviousPage) {
            if (isStartIntersecting) {
                chatroomMessages.fetchPreviousPage();
            }
        }
    }, [isStartIntersecting, chatroomMessages]);

    useEffect(() => {
        const deleteMessageHandler = async (data: {
            remover_id: string;
            id: string;
        }) => {
            if (!chatId) return;

            if (session.data?.user.id === data.remover_id) return;

            queryClient.setQueryData(
                ["messages", chatId],
                (oldData: InfiniteData<TChatroomMessage[]> | undefined) => {
                    if (!oldData) return;

                    const newData = oldData.pages.map((page) =>
                        page.filter((msg) => msg.id !== data.id)
                    );

                    return {
                        pages: newData,
                        pageParams: oldData.pageParams || [1],
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
                    (oldData: InfiniteData<TChatroomMessage[]> | undefined) => {
                        oldData?.pages[oldData?.pages.length - 1 ?? 0]
                            .sort((a, b) => {
                                if (a.id.length === b.id.length) return 0;
                                if (a.id.length > b.id.length) return -1;
                                return 1;
                            })
                            .map((msg) => {
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
                    (oldData: InfiniteData<TChatroomMessage[]> | undefined) => {
                        const newData: typeof oldData = JSON.parse(
                            JSON.stringify(oldData)
                        );
                        newData?.pages[newData.pages.length - 1 || 0].push(
                            data
                        );
                        return newData;
                    }
                );
            }
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
                className="mx-auto flex max-h-[calc(100svh-66px)] w-full max-w-screen-lg flex-1 flex-col items-center justify-center px-8 py-4"
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
            <div className="flex flex-1 flex-col overflow-y-auto p-2 px-4 scrollbar-thin scrollbar-track-black scrollbar-thumb-sky-100">
                {chatroomMessages.isLoading ? (
                    <div className="mt-auto flex w-full items-center justify-center">
                        <LoadingSpinner size={32} color="rgb(14 165 233)" />
                    </div>
                ) : chatroomMessages.isFetchingPreviousPage ? (
                    <LoadingSpinner size={32} color="rgb(14 165 233)" />
                ) : (
                    <div className="mt-auto w-full" ref={startRef} />
                )}

                {chatroomMessages.data?.pages.map((page, i) => (
                    <Fragment key={i}>
                        {page.map((message, msgIdx) => {
                            const isSameAuthor = shouldBeNewAuthor(
                                page,
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

            <div className="flex h-14 items-center gap-3 px-3">
                <button
                    className="group hidden rounded-full border-2 border-black p-2 hover:border-sky-500 focus:border-sky-500 sm:inline-block"
                    aria-label="Toggle chatroom settings modal."
                    onClick={handleSettings}
                >
                    <FiSettings
                        size={20}
                        className="group-hover:stroke-sky-500 group-focus:stroke-sky-500"
                    />
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
                        maxLength={150}
                        minLength={1}
                        disabled={!chatroomMessages.data}
                        className="h-10 w-full rounded-md border-2 border-black p-2 text-sm font-medium hover:border-sky-500 hover:outline-sky-500 focus:border-sky-500 focus:outline-sky-500 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        className="group rounded-full border-2 border-black p-2 hover:border-sky-500 focus:border-sky-500 disabled:opacity-50"
                        aria-label="Send message."
                        disabled={!chatroomMessages.data?.pages}
                    >
                        <VscSend
                            className="fill-black group-hover:fill-sky-500 group-focus:fill-sky-500 group-active:fill-sky-500"
                            size={20}
                        />
                    </button>
                </form>
            </div>
        </>
    );
};
