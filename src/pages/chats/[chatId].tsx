import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { VscTrash } from "react-icons/vsc";
import { useGetOwnedChatroomtroomsQuery } from "../../hooks/useGetOwnedChatroomtroomsQuery";
import { useDeleteOwnedChatroomMutation } from "../../hooks/useDeleteOwnedChatroomMutation";
import { useQueryClient } from "@tanstack/react-query";

const ChatPage = () => {
    const router = useRouter();
    const session = useSession();
    const queryClient = useQueryClient();
    const ownedChatroom = useGetOwnedChatroomtroomsQuery();
    const deleteOwnedChatroom = useDeleteOwnedChatroomMutation();

    const isOwner = session.data?.user.id === ownedChatroom.data?.owner_id;

    if (!ownedChatroom.data) return <div>wait</div>;

    const handleDelete = async () => {
        const chatId = router.query.chatId;
        if (!chatId) return;
        deleteOwnedChatroom.mutateAsync(
            {
                id: chatId,
            },
            {
                onSuccess: () =>
                    queryClient.resetQueries({ queryKey: ["owned_chatroom"] }),
            }
        );

        if (deleteOwnedChatroom.isError) return;

        router.push("/chats");
    };

    return (
        <div>
            <div>Single Chat Page {router.query.chatId}</div>
            {isOwner && (
                <button
                    onClick={handleDelete}
                    className="rounded-lg border border-black p-2 shadow-md"
                >
                    <VscTrash size={32} />
                </button>
            )}
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

    if (session && !session.user.username) {
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
