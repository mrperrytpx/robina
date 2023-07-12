import { useSession } from "next-auth/react";
import Image from "next/image";
import { useDeleteMessageMutation } from "../hooks/useDeleteMessageMutation";
import { useQueryClient } from "@tanstack/react-query";
import { formatTime } from "../util/formatTime";
import DefaultImage from "../../public/default.png";
import { TChatroomMessage } from "../hooks/useGetChatroomQuery";

interface IChatMessage {
    message: TChatroomMessage;
    isDifferentAuthor: boolean;
}

export const ChatMessage = ({ message, isDifferentAuthor }: IChatMessage) => {
    const session = useSession();
    const deleteMessage = useDeleteMessageMutation();
    const queryClient = useQueryClient();

    const date = new Date(message.created_at);

    return (
        <div
            className="group flex w-full items-start justify-center gap-2"
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
                    <p className=" hidden w-full text-right font-mono group-hover:block">
                        {new Intl.DateTimeFormat("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                        }).format(date)}
                    </p>
                </div>
            )}
            <div className="flex w-full flex-col">
                {!isDifferentAuthor && (
                    <div className="flex items-end justify-start gap-2">
                        <span className="mb-1 text-sm font-bold">
                            @{message.author.username}
                        </span>
                        <span className="mb-1 text-xs font-extralight">
                            {formatTime(date).replace(",", "")}
                        </span>
                    </div>
                )}
                <span className="break-all py-1 text-sm leading-4">
                    {message.content}
                </span>
            </div>
        </div>
    );
};
