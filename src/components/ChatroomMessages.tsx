import { Fragment, RefObject, useEffect, useRef, useState } from "react";
import { ChatMessage } from "./ChatMessage";
import {
    TChatroomMessage,
    useGetChatroomQuery,
} from "../hooks/useGetChatroomQuery";
import { useRouter } from "next/router";
import { z } from "zod";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { pusherClient } from "../lib/pusher";
import { useSession } from "next-auth/react";
import { useGetChatroomMessagesInfQuery } from "../hooks/useGetChatroomMessagesInfQuery";
import { shouldBeNewAuthor } from "../util/shouldBeNewAuthor";

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
            observer.disconnect();
        };
    }, [ref, options]);

    return isIntersecting;
};

export const ChatroomMessages = () => {
    const endRef = useRef<HTMLDivElement>(null);
    const startRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);
    const queryClient = useQueryClient();
    const session = useSession();

    const chatroom = useGetChatroomQuery(chatId);
    const chatroomMessages = useGetChatroomMessagesInfQuery(chatId);

    const isStartIntersecting = useIntersectionObserver(startRef, {});

    useEffect(() => {
        if (
            chatroomMessages.hasPreviousPage &&
            (chatroomMessages.data?.pages[0]?.length ?? 0) >= 50
        ) {
            if (isStartIntersecting) {
                chatroomMessages.fetchPreviousPage();
            }
        }
    }, [isStartIntersecting, chatroomMessages]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "instant" });
    }, [chatroomMessages.data]);

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

                    return { pages: newData, pageParams: oldData.pageParams };
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

    return (
        <div className="flex flex-1 flex-col overflow-y-auto p-2 px-4 scrollbar-thin scrollbar-track-black scrollbar-thumb-sky-100">
            <div className="mt-auto w-full" ref={startRef} />

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
                                ownerId={chatroom.data?.owner_id}
                            />
                        );
                    })}
                </Fragment>
            ))}
            <div ref={endRef} />
        </div>
    );
};
