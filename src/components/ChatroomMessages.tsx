import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { useGetChatroomQuery } from "../hooks/useGetChatroomQuery";
import { useRouter } from "next/router";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { pusherClient } from "../lib/pusher";
import { TChatroomData } from "../pages/api/chatroom/[chatId]/get";
import { useSession } from "next-auth/react";

export const ChatroomMessages = () => {
    const endRef = useRef<HTMLDivElement>(null);
    const startRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);
    const queryClient = useQueryClient();
    const session = useSession();

    const chatroom = useGetChatroomQuery(chatId);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "instant" });
    }, [chatroom.data?.messages]);

    useEffect(() => {
        const deleteMessageHandler = async (data: {
            remover_id: string;
            id: string;
        }) => {
            if (!chatId) return;

            if (session.data?.user.id === data.remover_id) return;

            queryClient.setQueryData(
                ["chatroom", chatId],
                (oldData: TChatroomData | undefined) => {
                    if (!oldData?.messages) return;

                    return {
                        ...oldData,
                        messages: oldData.messages.filter(
                            (message) => message.id !== data.id
                        ),
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
    }, [chatId, queryClient, chatroom.data?.messages, session.data?.user.id]);

    return (
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-track-black scrollbar-thumb-slate-400">
            <div ref={startRef} />

            {chatroom.data?.messages.map((message, i) => (
                <ChatMessage
                    isDifferentAuthor={
                        i > 0 &&
                        message.author_id ===
                            chatroom.data?.messages[i - 1].author_id
                    }
                    message={message}
                    key={message.id}
                    ownerId={chatroom.data.owner_id}
                />
            ))}
            <div ref={endRef} />
        </div>
    );
};