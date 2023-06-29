import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { useGetAllJoinedChatroomsQuery } from "../../hooks/useGetAllJoinedChatroomsQuery";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { CreateChatroom } from "../../components/CreateChatroom";
import { ChatroomCard } from "../../components/ChatroomCard";
import { Chatroom } from "@prisma/client";
import { useGetOwnedChatroomtroomsQuery } from "../../hooks/useGetOwnedChatroomtroomsQuery";

const ChatsPage = () => {
    const joinedChatrooms = useGetAllJoinedChatroomsQuery();
    const ownedChatroom = useGetOwnedChatroomtroomsQuery();

    // const date = new Date();

    // const data: Chatroom[] = [
    //     {
    //         id: "dkaskndjaskjda",
    //         name: "My chatroom",
    //         description:
    //             "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nam minima nisi officia molestiae cumque adipisci quidem deleniti voluptatibus voluptas aliquamitectoreiciendis, ipsam impedit ipsum sit cupiditate fuga inventore labore amet iusto voluptatem. Saepe maiores quia officiis nemo deleniti beatae. Ut, quisquam deleniti blanditiis reiciendis laudantium, corrupti fugiat, doloribus cupiditate sunt minima ullam nostrum sit magni. Temporibus, aliqquae? Placeat nihil, in animi reiciendis quidem inventore tenetur necessitatibus nostrum, illo, et culpa fugiat? Tenetur obcaecati explicabo perspiciatis sunt possimus laboriosam non at, delectus nemo deleniti impedit quasi officiis? Pariatur nisi dicta explicabo eius quidem itaque accusantium vel dignissimos. Non, nobis.",
    //         created_at: date,
    //         is_public: true,
    //         owner_id: "30219302",
    //     },
    // ];

    return (
        <div>
            <article className="mb-4 space-y-4 ">
                <h2 className="block border-b border-slate-200">
                    Owned Chatrooms
                </h2>
                <div className="flex flex-col gap-4 sm:flex-row">
                    {ownedChatroom.isLoading && <LoadingSpinner size={32} />}
                    {ownedChatroom.data && (
                        <ChatroomCard
                            id={ownedChatroom.data.id}
                            name={ownedChatroom.data.name}
                            description={ownedChatroom.data.description}
                        />
                    )}
                    <CreateChatroom />
                </div>
            </article>
            <article className="mb-4 space-y-4 ">
                <h2 className="block border-b border-slate-200">
                    Joined Chatrooms
                </h2>
                <div className="flex flex-col gap-4 sm:flex-row">
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

    return {
        props: { session },
    };
};
