import { useSession } from "next-auth/react";
import type { TChatroomMessage } from "../hooks/useGetChatroomMessagesQuery";
import Image from "next/image";
import { useGetOwnedChatroomtroomsQuery } from "../hooks/useGetOwnedChatroomtroomsQuery";

interface IChatMessage {
    message: TChatroomMessage;
    isDifferentAuthor: boolean;
}

export const ChatMessage = ({ message, isDifferentAuthor }: IChatMessage) => {
    const { author, author_id, content, created_at } = message;
    const session = useSession();
    const ownedChatroom = useGetOwnedChatroomtroomsQuery();

    const date = new Date(created_at);
    const timestamp = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);

    return (
        <div
            className="flex w-full flex-col items-start gap-0.5"
            style={{
                alignItems:
                    session.data?.user.id === author_id ? "end" : "start",
            }}
        >
            {!isDifferentAuthor && (
                <div
                    className="flex items-end gap-2"
                    style={{
                        flexDirection:
                            session.data?.user.id === author_id
                                ? "row-reverse"
                                : "row",
                    }}
                >
                    <div className="aspect-square w-8">
                        <Image
                            src={author.image}
                            width={100}
                            height={100}
                            alt={`${author.username}'s profile`}
                            className="rounded-full"
                        />
                    </div>
                    <span className="text-xs font-bold">
                        @{author.username}
                    </span>
                </div>
            )}
            <div
                className="flex max-w-[min(86%,450px)] items-end gap-2"
                style={{
                    flexDirection:
                        session.data?.user.id === author_id
                            ? "row"
                            : "row-reverse",
                }}
            >
                <p
                    className="rounded-md bg-gray-100 p-1 text-sm text-black first:mt-1"
                    style={{
                        border:
                            ownedChatroom.data?.owner_id === author_id
                                ? "2px solid orange"
                                : "",
                    }}
                >
                    {content}
                </p>
                <span className="min-w-[33px] text-right font-mono text-xs">
                    {timestamp}
                </span>
            </div>
        </div>
    );
};
