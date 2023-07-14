import Image from "next/image";
import { formatTime } from "../util/formatTime";
import DefaultImage from "../../public/default.png";
import {
    TChatroomMessage,
    useGetChatroomQuery,
} from "../hooks/useGetChatroomQuery";
import { VscCircleSlash } from "react-icons/vsc";
import { useDeleteMessageMutation } from "../hooks/useDeleteMessageMutation";
import { useRouter } from "next/router";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { TChatroomData } from "../pages/api/chatroom/get_chatroom";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { pusherClient } from "../lib/pusher";

interface IChatMessage {
    message: TChatroomMessage;
    isDifferentAuthor: boolean;
    ownerId: string;
}

export const ChatMessage = ({
    message,
    isDifferentAuthor,
    ownerId,
}: IChatMessage) => {
    const date = new Date(message.created_at);
    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);
    const queryClient = useQueryClient();
    const session = useSession();
    const chatroom = useGetChatroomQuery(chatId);

    const deleteMessage = useDeleteMessageMutation();

    useEffect(() => {
        const deleteMessageHandler = async (data: { id: string }) => {
            if (!chatId) return;

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
    }, [chatId, queryClient, chatroom.data?.messages]);

    const isAllowedToDelete =
        message.author_id === session.data?.user.id ||
        session.data?.user.id === ownerId;

    return (
        <div
            className="releative group grid w-full grid-cols-[48px,1fr] gap-1"
            style={{
                marginTop: !isDifferentAuthor ? "0.75rem" : "",
            }}
        >
            {!isDifferentAuthor ? (
                <div className="aspect-square w-12">
                    <Image
                        src={message.author.image || DefaultImage}
                        alt={`${message.author.username}'s profile image`}
                        width={100}
                        height={100}
                        className="w-full rounded-full"
                    />
                </div>
            ) : (
                <div className="mt-1 w-12 text-xs">
                    <span className="hidden w-full text-center font-mono group-hover:block">
                        {new Intl.DateTimeFormat("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                        }).format(date)}
                    </span>
                </div>
            )}
            <div className="flex flex-col overflow-hidden pl-1 group-hover:bg-slate-800 group-focus:bg-slate-800 group-active:bg-slate-800 active:bg-slate-800">
                {!isDifferentAuthor && (
                    <div className="flex items-end justify-start gap-2">
                        <span className="mb-1 text-sm font-bold">
                            @{message.author.username}{" "}
                            {message.author_id === ownerId && "- 🦁"}
                        </span>
                        <span className="mb-1 text-xs font-extralight">
                            {formatTime(date).replace(",", "")}
                        </span>
                    </div>
                )}
                <span className=" break-words py-1 text-sm leading-4 ">
                    {message.content}
                </span>
            </div>
            {isAllowedToDelete && (
                <button
                    onClick={async () =>
                        await deleteMessage.mutateAsync({
                            chatId,
                            messageId: message.id,
                        })
                    }
                    className="absolute right-5 hidden -translate-y-4 rounded-lg bg-black p-1.5 shadow-lg group-hover:block  group-focus:block group-active:block active:block"
                >
                    <VscCircleSlash size={20} fill="red" />
                </button>
            )}
        </div>
    );
};
