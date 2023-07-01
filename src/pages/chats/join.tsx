import React, { useState } from "react";
import { useJoinChatroomMutation } from "../../hooks/useJoinChatroomMutation";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";

const JoinChatroomPage = () => {
    const joinChatroom = useJoinChatroomMutation();

    const [inv, setInv] = useState("");

    return (
        <div>
            <button
                className="w-40 bg-white p-2 text-black shadow-md"
                onClick={async () => {
                    await joinChatroom.mutateAsync({
                        invite: inv,
                    });
                }}
            >
                join chat
            </button>
            <input
                className="text-black"
                type="text"
                value={inv}
                onChange={(e) => setInv(e.target.value)}
            />
        </div>
    );
};

export default JoinChatroomPage;

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
