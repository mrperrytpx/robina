import Image from "next/image";
import { formatTime } from "../util/formatTime";
import DefaultImage from "../../public/default.png";
import { TChatroomMessage } from "../hooks/useGetChatroomQuery";
import { VscTrash } from "react-icons/vsc";
import { useDeleteMessageMutation } from "../hooks/useDeleteMessageMutation";
import { useRouter } from "next/router";
import { z } from "zod";
import { useSession } from "next-auth/react";

interface IChatMessage {
    message: TChatroomMessage;
    isSameAuthor: boolean;
    ownerId: string | undefined;
}

export const ChatMessage = ({
    message,
    isSameAuthor,
    ownerId,
}: IChatMessage) => {
    const date = new Date(message.created_at);
    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);
    const session = useSession();
    const deleteMessage = useDeleteMessageMutation();

    const isAllowedToDelete =
        message.author_id === session.data?.user.id ||
        session.data?.user.id === ownerId;

    return (
        <div
            className="group/message relative grid w-full grid-cols-[48px,1fr] gap-1"
            style={{
                marginTop: !isSameAuthor ? "0.75rem" : "",
            }}
        >
            {!isSameAuthor ? (
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
                    <span className="hidden w-full text-center font-mono group-hover/message:block">
                        {new Intl.DateTimeFormat("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                        }).format(date)}
                    </span>
                </div>
            )}
            {isAllowedToDelete && (
                <button
                    onClick={async () =>
                        await deleteMessage.mutateAsync({
                            chatId,
                            messageId: message.id,
                        })
                    }
                    aria-label="Delete message."
                    className="group/delete peer absolute right-3 hidden -translate-y-4 rounded-lg bg-white p-1.5 text-black shadow-lg group-hover/message:block  group-focus/message:block group-active/message:block active:block"
                >
                    <VscTrash
                        className="fill-black group-hover/delete:fill-red-600 group-focus/delete:fill-red-600"
                        size={20}
                    />
                </button>
            )}
            <div className="flex flex-col overflow-hidden pl-1 peer-hover:bg-sky-50 hover:bg-sky-50">
                {!isSameAuthor && (
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
                <span
                    className={`select-text break-words py-1 pl-1 text-sm leading-4 ${
                        message.id.length === 10 && "opacity-50"
                    }`}
                >
                    {message.content}
                </span>
            </div>
        </div>
    );
};
