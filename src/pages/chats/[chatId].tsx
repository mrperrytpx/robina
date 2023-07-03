import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { VscTrash } from "react-icons/vsc";
import { useGetOwnedChatroomtroomsQuery } from "../../hooks/useGetOwnedChatroomtroomsQuery";
import { useDeleteOwnedChatroomMutation } from "../../hooks/useDeleteOwnedChatroomMutation";
import { z } from "zod";
import { usePostChatMessageMutation } from "../../hooks/usePostChatMessageMutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useGetChatroomMessagesQuery } from "../../hooks/useGetChatroomMessagesQuery";
import { useUpdateWhitelistMutation } from "../../hooks/useUpdateWhitelistMutation";
import { useCreateChatroomInviteMutation } from "../../hooks/useCreateChatroomInviteMutation";
import { useEffect } from "react";
import { pusherClient } from "../../lib/pusher";
import { useQueryClient } from "@tanstack/react-query";
import { Message } from "@prisma/client";

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatMessageSchema = z.object({
    message: z
        .string()
        .min(1, "Message cannot be empty")
        .max(150, "Message cannot exceed 150 characters"),
});

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
    } = useForm<ChatMessage>({
        resolver: zodResolver(chatMessageSchema),
    });

    const queryClient = useQueryClient();

    const isOwner = session.data?.user.id === ownedChatroom.data?.owner_id;

    useEffect(() => {
        const newMessageHandler = async (data: Message) => {
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
    }, [chatId]);

    const handleDelete = async () => {
        if (!chatId) return;

        const response = await deleteOwnedChatroom.mutateAsync({
            chatId,
        });

        if (!response.ok) return;

        router.push("/chats");
    };

    const onSubmit: SubmitHandler<ChatMessage> = async (data) => {
        if (!chatId) return;

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
        <div className="space-x-2 space-y-2">
            <div>Single Chat Page {chatId}</div>
            {isOwner && (
                <button
                    onClick={handleDelete}
                    className="rounded-lg border border-black p-2 shadow-md"
                >
                    <VscTrash size={32} />
                </button>
            )}
            <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <label className="block text-xs" htmlFor="message">
                        <strong className="uppercase">Chatroom name</strong>
                    </label>
                    <input
                        {...register("message")}
                        name="message"
                        id="message"
                        type="message"
                        className="h-10 w-full rounded-md border border-slate-500 bg-black p-2 text-sm font-medium focus:bg-slate-200 focus:text-black"
                        placeholder="Message"
                    />
                    {errors.message && (
                        <span className="text-xs font-semibold text-red-500">
                            {errors.message.message}
                        </span>
                    )}
                    <button
                        type="submit"
                        className="w-40 bg-white p-2 text-black shadow-md"
                    >
                        {postMessage.isLoading ? "Sending..." : "Send message"}
                    </button>
                </form>
            </div>
            <div>
                {chatroomMessages.data &&
                    chatroomMessages.data.map((message) => (
                        <div key={message.id}>{message.content}</div>
                    ))}
            </div>
            <button
                className="w-40 bg-white p-2 text-black shadow-md"
                onClick={async () => {
                    await createInvite.mutateAsync({
                        chatId,
                    });
                }}
            >
                create inv link
            </button>
            <button
                className="w-40 bg-white p-2 text-black shadow-md"
                onClick={async () => {
                    await updateWhitelist.mutateAsync({
                        username: "perryx1",
                        chatId,
                    });
                }}
            >
                add to whitelist
            </button>

            {createInvite.data && <div>{createInvite.data.value}</div>}
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
