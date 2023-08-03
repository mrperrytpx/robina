import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import NextNProgress from "nextjs-progressbar";
import { Header } from "../components/Header";
import { TChatroomInvite } from "../hooks/useGetUserPendingInvitesQuery";
import { TChatroomWIthOwner } from "./api/chatroom/get_owned";
import type Pusher from "pusher-js/types/src/core/pusher";
import { CookieBanner } from "../components/CookieBanner";

interface ILayoutProps {
    children: React.ReactNode;
}

let socketClient: Pusher;

const Layout = ({ children }: ILayoutProps) => {
    const session = useSession();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (session.data?.user) {
            import("../lib/pusher").then(({ pusherClient }) => {
                socketClient = pusherClient;
            });
        }
    }, [session.data?.user]);

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

        if (session.data?.user && socketClient) {
            socketClient.subscribe(`chat__${session.data.user.id}__new-invite`);
            socketClient.bind("new-invite", newInviteHandler);
        }

        return () => {
            if (socketClient && session.data?.user) {
                socketClient.unsubscribe(
                    `chat__${session.data.user.id}__new-invite`
                );
                socketClient.unbind("new-invite", newInviteHandler);
            }
        };
    }, [queryClient, session.data?.user]);

    useEffect(() => {
        const banUser = async (data: {
            id: string;
            chatId: string;
            chatroomName: string;
        }) => {
            if (data.id === session.data?.user.id) {
                toast.error(`You have been removed from ${data.chatroomName}!`);
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

        if (session.data?.user && socketClient) {
            socketClient.subscribe(`chat__${session.data?.user.id}__ban`);
            socketClient.bind("ban", banUser);
        }

        return () => {
            if (socketClient && session.data?.user) {
                socketClient.unsubscribe(`chat__${session.data?.user.id}__ban`);
                socketClient.unbind("ban", banUser);
            }
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

        if (session.data?.user && socketClient) {
            socketClient.subscribe(
                `chat__${session.data?.user.id}__revoke-invite`
            );
            socketClient.bind("revoke-invite", revokeInvite);
        }

        return () => {
            if (socketClient && session.data?.user) {
                socketClient.unsubscribe(
                    `chat__${session.data?.user.id}__revoke-invite`
                );
                socketClient.unbind("revoke-invite", revokeInvite);
            }
        };
    }, [queryClient, session.data?.user]);

    return (
        <div className="relative flex flex-col">
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
            <CookieBanner />
            <ErrorBoundary>
                <main className="mx-auto flex min-h-[calc(100svh-66px)] w-full flex-1">
                    {children}
                </main>
            </ErrorBoundary>
        </div>
    );
};

export default Layout;
