import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import {
    TChatroomMessage,
    useGetChatroomQuery,
} from "../hooks/useGetChatroomQuery";
import { useRouter } from "next/router";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { pusherClient } from "../lib/pusher";
import { useSession } from "next-auth/react";
import { useGetChatroomMessagesQuery } from "../hooks/useGetChatroomMessagesQuery";

export const ChatroomMessages = () => {
    const endRef = useRef<HTMLDivElement>(null);
    const startRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);
    const queryClient = useQueryClient();
    const session = useSession();

    const chatroom = useGetChatroomQuery(chatId);
    const chatroomMessages = useGetChatroomMessagesQuery(chatId);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "instant" });
    }, [chatroomMessages?.data]);

    useEffect(() => {
        const deleteMessageHandler = async (data: {
            remover_id: string;
            id: string;
        }) => {
            if (!chatId) return;

            if (session.data?.user.id === data.remover_id) return;

            queryClient.setQueryData(
                ["messages", chatId],
                (oldData: TChatroomMessage[] | undefined) => {
                    if (!oldData) return;
                    return oldData.filter((msg) => msg.id !== data.id);
                }
            );
        };

        pusherClient.subscribe(`chat__${chatId}__delete-message`);
        pusherClient.bind("delete-message", deleteMessageHandler);

        return () => {
            pusherClient.unsubscribe(`chat__${chatId}__delete-message`);
            pusherClient.unbind("delete-message", deleteMessageHandler);
        };
    }, [chatId, queryClient, chatroomMessages.data, session.data?.user.id]);

    return (
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-track-black scrollbar-thumb-slate-400">
            <div ref={startRef} />

            {chatroomMessages.data?.map((message, i) => (
                <ChatMessage
                    isDifferentAuthor={
                        i > 0 &&
                        message.author_id ===
                            chatroomMessages.data?.[i - 1].author_id
                    }
                    message={message}
                    key={message.id}
                    ownerId={chatroom.data?.owner_id}
                />
            ))}
            <div ref={endRef} />
        </div>
    );
};
