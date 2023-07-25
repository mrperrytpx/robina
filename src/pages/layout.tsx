import React, { useEffect } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { TChatroomInvites } from "../hooks/useGetUserPendingInvitesQuery";
import { Chatroom } from "@prisma/client";
import { pusherClient } from "../lib/pusher";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import NextNProgress from "nextjs-progressbar";
import { Header } from "../components/Header";

interface ILayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: ILayoutProps) => {
    const session = useSession();
    const queryClient = useQueryClient();

    useEffect(() => {
        const newInviteHandler = async (data: Chatroom) => {
            toast.success(`You are invited to join ${data.name}!`);
            queryClient.setQueryData(
                ["invites", session.data?.user.id],
                (oldData: Chatroom[] | undefined) => {
                    if (!oldData) return [data];
                    return [...oldData, data];
                }
            );
            queryClient.invalidateQueries(["invites", session.data?.user.id]);
        };

        pusherClient.subscribe(`chat__${session.data?.user.id}__new-invite`);
        pusherClient.bind("new-invite", newInviteHandler);

        return () => {
            pusherClient.unsubscribe(
                `chat__${session.data?.user.id}__new-invite`
            );
            pusherClient.unbind("new-invite", newInviteHandler);
        };
    }, [queryClient, session.data?.user.id]);

    useEffect(() => {
        const banUser = async (data: {
            id: string;
            chatId: string;
            chatroomName: string;
        }) => {
            if (data.id === session.data?.user.id) {
                toast.error(`You got removed from "${data.chatroomName}"!`);
                queryClient.setQueryData(
                    ["chatrooms", session.data?.user.id],
                    (oldData: Chatroom[] | undefined) => {
                        if (!oldData) return;
                        return oldData.filter(
                            (chatroom) => chatroom.id !== data.chatId
                        );
                    }
                );

                [
                    "chatroom",
                    "invite",
                    "banned_members",
                    "chat_invites",
                    "members",
                    "messages",
                ].forEach((query) =>
                    queryClient.removeQueries([query, data.chatId])
                );
            }
        };

        pusherClient.subscribe(`chat__${session.data?.user.id}__ban`);
        pusherClient.bind("ban", banUser);

        return () => {
            pusherClient.unsubscribe(`chat__${session.data?.user.id}__ban`);
            pusherClient.unbind("ban", banUser);
        };
    }, [queryClient, session.data?.user.id]);

    useEffect(() => {
        const revokeInvite = (data: { chatId: string; userId: string }) => {
            queryClient.setQueryData(
                ["invites", session.data?.user.id],
                (oldData: TChatroomInvites | undefined) => {
                    if (!oldData) return;
                    return oldData.filter(
                        (chatroom) => chatroom.id !== data.chatId
                    );
                }
            );
            queryClient.invalidateQueries(["invites", session.data?.user.id]);
        };

        pusherClient.subscribe(`chat__${session.data?.user.id}__revoke-invite`);
        pusherClient.bind("revoke-invite", revokeInvite);

        return () => {
            pusherClient.unsubscribe(
                `chat__${session.data?.user.id}__revoke-invite`
            );
            pusherClient.unbind("revoke-invite", revokeInvite);
        };
    }, [queryClient, session.data?.user.id]);

    return (
        <>
            <Head>
                <title>Yet another messaging app</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="relative flex min-h-[100svh] flex-col">
                <Header />
                <NextNProgress
                    height={2}
                    options={{
                        showSpinner: false,
                        trickle: true,
                    }}
                    color="black"
                    showOnShallow={false}
                />
                <ErrorBoundary>
                    <main className="mx-auto flex min-h-[calc(100svh-66px)] w-full flex-1">
                        {children}
                    </main>
                </ErrorBoundary>
            </div>
        </>
    );
};

export default Layout;
