import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { useGetAllJoinedChatroomsQuery } from "../../hooks/useGetAllJoinedChatroomsQuery";
import {
    EnterChatroomCard,
    InviteChatroomCard,
    LoadingChatroomCard,
    NewChatroomCard,
} from "../../components/ChatroomCard";
import { useGetOwnedChatroomtroomsQuery } from "../../hooks/useGetOwnedChatroomtroomsQuery";
import { useRouter } from "next/router";
import { Portal } from "../../components/Portal";
import CreateChatPage from "./create";
import JoinChatroomPage from "./join";
import { useGetUserPendingInvitesQuery } from "../../hooks/useGetUserPendingInvitesQuery";

const ChatsPage = () => {
    const joinedChatrooms = useGetAllJoinedChatroomsQuery();
    const ownedChatroom = useGetOwnedChatroomtroomsQuery();
    const pendingInvites = useGetUserPendingInvitesQuery();

    const router = useRouter();

    return (
        <div className="mx-auto max-w-screen-lg flex-1 p-4">
            <article className="mb-4 flex flex-col space-y-2">
                <h2 className="block text-center font-bold uppercase sm:pl-2 sm:text-left">
                    Owned Chatroom
                </h2>
                <div className="flex flex-col flex-wrap items-center gap-4 sm:flex-row">
                    {ownedChatroom.isLoading ? (
                        <LoadingChatroomCard />
                    ) : ownedChatroom.data?.id ? (
                        <EnterChatroomCard chatroom={ownedChatroom.data} />
                    ) : (
                        <NewChatroomCard
                            title="Create New Chatroom"
                            href="/chats?create=1"
                            hrefAs="/chats/create"
                        />
                    )}
                </div>
            </article>
            <article className="my-8 space-y-2">
                <h2 className="block text-center font-bold uppercase sm:pl-2 sm:text-left">
                    Joined Chatrooms
                </h2>
                <div className="flex flex-col flex-wrap items-center gap-4 sm:flex-row sm:items-start">
                    {joinedChatrooms.isLoading ? (
                        <LoadingChatroomCard />
                    ) : (
                        joinedChatrooms.data?.map((chatroom) => (
                            <EnterChatroomCard
                                key={chatroom.id}
                                chatroom={chatroom}
                            />
                        ))
                    )}
                    {!joinedChatrooms.isLoading && (
                        <NewChatroomCard
                            title="Join a Chatroom"
                            href="/chats?join=1"
                            hrefAs="/chats/join"
                        />
                    )}
                </div>
            </article>
            {pendingInvites.data?.length ? (
                <article className="my-8 space-y-2">
                    <h2 className="block text-center font-bold uppercase sm:pl-2 sm:text-left">
                        Invited to
                    </h2>
                    <div className="flex flex-col flex-wrap items-center gap-4 sm:flex-row sm:items-start">
                        {pendingInvites.data?.map((chatroom) => (
                            <InviteChatroomCard
                                key={chatroom.id}
                                chatroom={chatroom}
                            />
                        ))}
                    </div>
                </article>
            ) : null}
            {router.query.create && (
                <Portal shouldRoute={true}>
                    <CreateChatPage />
                </Portal>
            )}
            {router.query.join && (
                <Portal shouldRoute={true}>
                    <JoinChatroomPage />
                </Portal>
            )}
        </div>
    );
};

export default ChatsPage;

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
