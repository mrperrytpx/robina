import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { VscSend } from "react-icons/vsc";
import { FiSettings, FiUsers } from "react-icons/fi";
import { z } from "zod";
import { usePostChatMessageMutation } from "../../hooks/usePostChatMessageMutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { pusherClient } from "../../lib/pusher";
import { useQueryClient } from "@tanstack/react-query";
import { chatMessageSchema } from "../../lib/zSchemas";
import type { TChatMessage } from "../../lib/zSchemas";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import {
    TChatroomMessage,
    useGetChatroomQuery,
} from "../../hooks/useGetChatroomQuery";
import { User } from "@prisma/client";
import { ChatroomMembers } from "../../components/ChatroomMembers";
import { ChatroomSettings } from "../../components/ChatroomSettings";
import { ChatroomMessages } from "../../components/ChatroomMessages";
import { randomString } from "../../util/randomString";
import { useGetChatroomMembersQuery } from "../../hooks/useGetChatroomMembersQuery";

const ChatPage = () => {
    const [isMembersActive, setIsMembersActive] = useState(false);
    const [isSettingsActive, setIsSettingsActive] = useState(false);

    const router = useRouter();
    const chatId = z.string().parse(router.query.chatId);
    const session = useSession();
    const postMessage = usePostChatMessageMutation();

    const chatroom = useGetChatroomQuery(chatId);
    const chatroomMembers = useGetChatroomMembersQuery(chatId);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        reset,
    } = useForm<TChatMessage>({
        resolver: zodResolver(chatMessageSchema),
    });

    const queryClient = useQueryClient();

    useEffect(() => {
        const newMessageHandler = async (
            data: TChatroomMessage & { fakeId: string }
        ) => {
            if (!chatId) return;
            if (data.author_id === session.data?.user.id) {
                queryClient.setQueryData(
                    ["messages", chatId],
                    (oldData: TChatroomMessage[] | undefined) => {
                        oldData?.map((msg) => {
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
                    (oldData: TChatroomMessage[] | undefined) => {
                        if (!oldData) return [data];
                        return [...oldData, data];
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

    useEffect(() => {
        const newUserHandler = async (data: User) => {
            if (!chatId) return;
            queryClient.setQueryData(
                ["members", chatId],
                (oldData: User[] | undefined) => {
                    const newData: User[] = JSON.parse(JSON.stringify(oldData));
                    newData.push(data);
                    return newData;
                }
            );
            queryClient.invalidateQueries(["members", chatId]);
        };

        pusherClient.subscribe(`chat__${chatId}__new-member`);
        pusherClient.bind("new-member", newUserHandler);

        return () => {
            pusherClient.unsubscribe(`chat__${chatId}__new-member`);
            pusherClient.unbind("new-member", newUserHandler);
        };
    }, [chatId, queryClient]);

    useEffect(() => {
        const removeUserHandler = async (data: { id: string }) => {
            if (!chatId) return;

            if (data.id === session.data?.user.id) {
                queryClient.removeQueries(["members", chatId]);
                queryClient.removeQueries(["messages", chatId]);
                router.push("/chats");
            } else {
                queryClient.setQueryData(
                    ["members", chatId],
                    (oldData: User[] | undefined) => {
                        if (!oldData) return;

                        return oldData.filter(
                            (member) => member.id !== data.id
                        );
                    }
                );
                queryClient.setQueryData(
                    ["messages", chatId],
                    (oldData: TChatroomMessage[] | undefined) => {
                        return oldData?.filter(
                            (msg) => msg.author_id !== data.id
                        );
                    }
                );
                queryClient.invalidateQueries(["members", chatId]);
            }
        };

        pusherClient.subscribe(`chat__${chatId}__remove-member`);
        pusherClient.bind("remove-member", removeUserHandler);

        return () => {
            pusherClient.unsubscribe(`chat__${chatId}__remove-member`);
            pusherClient.unbind("remove-member", removeUserHandler);
        };
    }, [chatId, queryClient, router, session.data?.user.id]);

    useEffect(() => {
        const leaveChatroomHandler = async (data: { id: string }) => {
            if (!chatId) return;

            if (data.id === session.data?.user.id) {
                router.push("/chats");
            } else {
                queryClient.setQueryData(
                    ["members", chatId],
                    (oldData: User[] | undefined) => {
                        if (!oldData) return;

                        return oldData.filter(
                            (member) => member.id !== data.id
                        );
                    }
                );
            }
        };

        pusherClient.subscribe(`chat__${chatId}__member-leave`);
        pusherClient.bind("member-leave", leaveChatroomHandler);

        return () => {
            pusherClient.unsubscribe(`chat__${chatId}__member-leave`);
            pusherClient.unbind("member-leave", leaveChatroomHandler);
        };
    }, [
        chatId,
        queryClient,
        chatroomMembers.data,
        router,
        session.data?.user.id,
    ]);

    const onSubmit: SubmitHandler<TChatMessage> = async (data) => {
        if (!chatId) return;
        reset();

        const response = await postMessage.mutateAsync({
            ...data,
            chatId,
            fakeId: randomString(10),
        });

        if (!response?.ok) {
            const error = await response?.text();
            setError("root", { message: error || "Server Error" });
            return;
        }
    };

    const handleSettings = () => {
        setIsSettingsActive(!isSettingsActive);
        setIsMembersActive(false);
    };

    const handleMembers = () => {
        setIsMembersActive(!isMembersActive);
        setIsSettingsActive(false);
    };

    if (chatroom.isLoading) return <LoadingSpinner />;

    if (!chatroom.data) {
        return <div>You&apos;re not a part of this chatroom :)</div>;
    }

    return (
        <div className="flex max-h-[calc(100svh-64px)] w-full flex-row">
            <div className="flex max-h-[calc(100svh-64px)] w-full flex-col">
                <div className="flex h-14 w-full items-center justify-between px-4 shadow sm:hidden">
                    <div className="flex items-center gap-2">
                        <button className="group p-2" onClick={handleSettings}>
                            <FiSettings
                                className=" group-hover:scale-110 group-hover:stroke-sky-500 group-focus:scale-110 group-focus:stroke-sky-500 group-active:scale-110"
                                size={24}
                            />
                        </button>
                        <span className="line-clamp-2 text-xs font-semibold">
                            {chatroom.data.name}
                        </span>
                    </div>
                    <button className="group p-2" onClick={handleMembers}>
                        <FiUsers
                            className="group-hover:scale-110 group-hover:stroke-sky-500 group-focus:scale-110 group-focus:stroke-sky-500 group-active:scale-110"
                            size={24}
                        />
                    </button>
                </div>
                <div className="line-clamp-2 hidden border-b-2 border-black px-4 py-2 text-sm font-semibold shadow sm:block">
                    {chatroom.data.name}
                </div>
                <ChatroomMessages />
                <div className="mb-2 flex h-14 items-center gap-3 px-4">
                    <button
                        type="submit"
                        className="group hidden rounded-full border-2 border-black p-2 sm:inline-block"
                        aria-label="Send message"
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
                            className="h-10 w-full rounded-md border-2 border-black p-2 text-sm font-medium hover:border-sky-500 hover:outline-sky-500 focus:border-sky-500 focus:outline-sky-500"
                        />
                        <button
                            type="submit"
                            className="group rounded-full border-2 border-black p-2"
                            aria-label="Send message"
                        >
                            <VscSend
                                className="fill-black group-hover:fill-sky-500 group-focus:fill-sky-500 group-active:fill-sky-500"
                                size={20}
                            />
                        </button>
                    </form>
                </div>
                {isSettingsActive && (
                    <ChatroomSettings ownerId={chatroom.data.owner_id} />
                )}
                {isMembersActive && (
                    <ChatroomMembers ownerId={chatroom.data.owner_id} />
                )}
            </div>
            <div className="hidden h-full sm:block">
                <ChatroomMembers ownerId={chatroom.data.owner_id} />
            </div>
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
                destination: `/force-username`,
                permanent: false,
            },
        };
    }

    return {
        props: { session },
    };
};
