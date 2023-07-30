import React, { useEffect } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { pusherClient } from "../lib/pusher";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import NextNProgress from "nextjs-progressbar";
import { Header } from "../components/Header";
import { TChatroomInvite } from "../hooks/useGetUserPendingInvitesQuery";
import { TChatroomWIthOwner } from "./api/chatroom/get_owned";

interface ILayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: ILayoutProps) => {
    const session = useSession();
    const queryClient = useQueryClient();

    useEffect(() => {
        const newInviteHandler = async (data: TChatroomInvite) => {
            toast.success(`You are invited to join ${data.name}!`);
            queryClient.setQueryData(
                ["invites", session.data?.user.id],
                (oldData: TChatroomInvite[] | undefined) => {
                    if (!oldData) return [data];
                    return [...oldData, data];
                }
            );
            queryClient.invalidateQueries(["invites", session.data?.user.id]);
        };

        if (session.data?.user) {
            pusherClient.subscribe(
                `chat__${session.data?.user.id}__new-invite`
            );
            pusherClient.bind("new-invite", newInviteHandler);
        }

        return () => {
            pusherClient.unsubscribe(
                `chat__${session.data?.user.id}__new-invite`
            );
            pusherClient.unbind("new-invite", newInviteHandler);
        };
    }, [queryClient, session.data?.user]);

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
                    (oldData: TChatroomWIthOwner[] | undefined) => {
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

        if (session.data?.user) {
            pusherClient.subscribe(`chat__${session.data?.user.id}__ban`);
            pusherClient.bind("ban", banUser);
        }

        return () => {
            pusherClient.unsubscribe(`chat__${session.data?.user.id}__ban`);
            pusherClient.unbind("ban", banUser);
        };
    }, [queryClient, session.data?.user]);

    useEffect(() => {
        const revokeInvite = (data: { chatId: string; userId: string }) => {
            queryClient.setQueryData(
                ["invites", session.data?.user.id],
                (oldData: TChatroomInvite[] | undefined) => {
                    if (!oldData) return;
                    return oldData.filter(
                        (chatroom) => chatroom.id !== data.chatId
                    );
                }
            );
            queryClient.invalidateQueries(["invites", session.data?.user.id]);
        };

        if (session.data?.user) {
            pusherClient.subscribe(
                `chat__${session.data?.user.id}__revoke-invite`
            );
            pusherClient.bind("revoke-invite", revokeInvite);
        }

        return () => {
            pusherClient.unsubscribe(
                `chat__${session.data?.user.id}__revoke-invite`
            );
            pusherClient.unbind("revoke-invite", revokeInvite);
        };
    }, [queryClient, session.data?.user]);

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
