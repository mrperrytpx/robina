import { useJoinChatroomMutation } from "../../hooks/useJoinChatroomMutation";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { VscArrowLeft } from "react-icons/vsc";
import Head from "next/head";

const joinChatroomSchema = z.object({
    invite: z.string().length(10, "Invite string must be 10 characters long"),
});

type TJoinChatroomFormValues = z.infer<typeof joinChatroomSchema>;

const JoinChatroomPage = () => {
    const joinChatroom = useJoinChatroomMutation();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        reset,
    } = useForm<TJoinChatroomFormValues>({
        resolver: zodResolver(joinChatroomSchema),
    });

    const onSubmit: SubmitHandler<TJoinChatroomFormValues> = async (data) => {
        const response = await joinChatroom.mutateAsync({ ...data });

        if (!response?.ok) {
            const error = await response?.text();
            setError("root", { message: error || "Server Error" });
            return;
        } else {
            reset();
            router.push("/chats");
        }
        return;
    };

    return (
        <>
            <Head>
                <title>Join a chatroom</title>

                <meta
                    name="description"
                    content="Join a chatroom by using an invite string."
                    key="description"
                />
                <meta
                    property="og:description"
                    content="Join a chatroom by using an invite string."
                    key="og-description"
                />
                <meta
                    property="og:title"
                    content="YetAnotherMessagingApp - Join a Chatroom"
                    key="title"
                />
                <meta
                    property="og:url"
                    content={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/chats/join`}
                    key="url"
                />
            </Head>
            <div className="flex w-full max-w-screen-sm flex-1 flex-col items-center bg-glacier-50 p-4 sm:mx-auto sm:my-20 sm:max-w-md sm:rounded-xl">
                <div className="flex w-full max-w-md flex-col p-2">
                    <button
                        onClick={() => router.back()}
                        className="group mb-6 flex select-none items-center gap-1 self-start rounded-md border-2 border-glacier-900 bg-white px-2 py-1 text-sm font-semibold uppercase text-glacier-900 antialiased transition-all duration-75 hover:border-glacier-600 hover:bg-glacier-600 hover:text-glacier-50 focus:border-glacier-600 focus:bg-glacier-600 focus:text-glacier-50 "
                    >
                        <VscArrowLeft
                            className="group-hover:fill-glacier-50 group-focus:fill-glacier-50"
                            size={32}
                        />{" "}
                        Go Back
                    </button>
                    <form
                        className="flex w-full flex-col items-center gap-8"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="flex w-full flex-col items-center gap-2">
                            <div className="flex w-full flex-col items-center gap-2 sm:flex-row">
                                <label
                                    className="text-sm text-glacier-900"
                                    htmlFor="invite"
                                >
                                    <strong className="uppercase">
                                        Invite String:
                                    </strong>
                                </label>
                                <input
                                    {...register("invite")}
                                    name="invite"
                                    id="invite"
                                    type="text"
                                    className={`h-10 w-full border-b-2 border-glacier-900 p-2 text-center text-sm font-medium transition-all duration-75 hover:border-glacier-400 focus:border-glacier-400 focus:outline-glacier-400 sm:w-auto sm:text-left ${
                                        errors.invite && "border-red-600"
                                    }`}
                                    placeholder="__________"
                                    autoComplete="false"
                                    maxLength={10}
                                    minLength={1}
                                />
                            </div>
                            {errors.invite && (
                                <span className="text-xs font-semibold text-red-600">
                                    {errors.invite.message}
                                </span>
                            )}
                        </div>
                        <div className="flex w-full flex-col items-center gap-2">
                            <button
                                className="h-10 w-full max-w-[250px] select-none rounded-md border-2 border-black bg-white p-2 text-sm font-medium shadow-glacier-600 transition-all duration-75 enabled:hover:border-glacier-600 enabled:hover:bg-glacier-600 enabled:hover:text-white enabled:hover:shadow-sm enabled:focus:border-glacier-600 enabled:focus:bg-glacier-600 enabled:focus:text-white enabled:focus:shadow-sm disabled:border-glacier-200 disabled:bg-glacier-200 disabled:text-glacier-700 disabled:opacity-50"
                                type="submit"
                                disabled={joinChatroom.isLoading}
                            >
                                {joinChatroom.isLoading
                                    ? "Joining..."
                                    : "Join!"}
                            </button>
                            {errors.root && (
                                <span className="text-xs font-semibold text-red-600">
                                    {errors.root.message}
                                </span>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </>
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
                destination: `/signin?callbackUrl=${encodeURIComponent(
                    process.env.NEXTAUTH_URL + ctx.resolvedUrl
                )}`,
                permanent: false,
            },
        };
    }

    if (session && !session.user.username) {
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
