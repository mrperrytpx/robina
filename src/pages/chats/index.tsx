import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { useGetAllJoinedChatroomsQuery } from "../../hooks/useGetAllJoinedChatroomsQuery";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { CreateChatroom } from "../../components/CreateChatroom";
import { ChatroomCard } from "../../components/ChatroomCard";
import { useGetOwnedChatroomtroomsQuery } from "../../hooks/useGetOwnedChatroomtroomsQuery";
import { useRouter } from "next/router";
import { Portal } from "../../components/Portal";
import CreateChatPage from "./create";

const ChatsPage = () => {
    const joinedChatrooms = useGetAllJoinedChatroomsQuery();
    const ownedChatroom = useGetOwnedChatroomtroomsQuery();

    const router = useRouter();

    return (
        <div className="flex-1 p-4">
            <article className="mb-4 flex flex-col space-y-2">
                <h2 className="block text-center font-bold uppercase sm:pl-2 sm:text-left">
                    Owned Chatrooms
                </h2>
                <div className="flex flex-col flex-wrap items-center gap-4 sm:flex-row">
                    {ownedChatroom.isLoading && <LoadingSpinner size={32} />}
                    {ownedChatroom.data?.id && (
                        <ChatroomCard
                            id={ownedChatroom.data.id}
                            name={ownedChatroom.data.name}
                            description={ownedChatroom.data.description}
                        />
                    )}
                    <CreateChatroom />
                </div>
            </article>
            <article className="my-8 space-y-2">
                <h2 className="block text-center font-bold uppercase sm:pl-2 sm:text-left">
                    Joined Chatrooms
                </h2>
                <div className="flex flex-col flex-wrap items-center gap-4 sm:flex-row">
                    {joinedChatrooms.isLoading && <LoadingSpinner size={32} />}
                    {joinedChatrooms.data &&
                        joinedChatrooms.data.map((chatroom) => (
                            <ChatroomCard
                                key={chatroom.id}
                                id={chatroom.id}
                                name={chatroom.name}
                                description={chatroom.description}
                            />
                        ))}
                </div>
            </article>
            {router.query.create && (
                <Portal>
                    <CreateChatPage />
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
                destination: `/profile/username`,
                permanent: false,
            },
        };
    }

    return {
        props: { session },
    };
};
