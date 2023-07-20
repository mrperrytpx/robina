import { useJoinChatroomMutation } from "../../hooks/useJoinChatroomMutation";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import Link from "next/link";
import { VscArrowLeft } from "react-icons/vsc";

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
            router.push("/chats");
        }
    };

    return (
        <div className="flex w-full max-w-screen-sm flex-1 flex-col items-center rounded-xl bg-white p-4 sm:mx-auto sm:my-20 sm:max-w-md">
            <div className="flex w-full max-w-md flex-col p-2">
                <Link
                    className="group mb-6 flex items-center gap-1 self-start rounded-md border-2 border-black px-2 py-1 text-sm font-semibold uppercase antialiased shadow  hover:border-white hover:shadow-sky-500 focus:border-white focus:shadow-sky-500"
                    href="/chats"
                >
                    <VscArrowLeft
                        className="group-hover:fill-sky-500 group-focus:fill-sky-500"
                        size={32}
                    />{" "}
                    Go Back
                </Link>
                <form
                    className="flex w-full flex-col items-center gap-8"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="flex w-full flex-col items-center gap-2">
                        <div className="flex w-full flex-col items-center gap-2 sm:flex-row">
                            <label className="text-sm" htmlFor="invite">
                                <strong className="uppercase">
                                    Invite String:
                                </strong>
                            </label>
                            <input
                                {...register("invite")}
                                name="invite"
                                id="invite"
                                type="text"
                                className="h-10 w-full border-b-2 border-black p-2 text-center text-sm font-medium hover:border-sky-500 hover:outline-sky-500 focus:border-white focus:outline-sky-500 sm:w-auto sm:text-left"
                                placeholder="__________"
                                autoComplete="false"
                            />
                        </div>
                        {errors.invite && (
                            <span className="text-xs font-semibold text-red-500">
                                {errors.invite.message}
                            </span>
                        )}
                    </div>
                    <div className="flex w-full flex-col items-center gap-2">
                        <button
                            className="h-10 w-full max-w-[250px] rounded-md border-2 border-black bg-white p-2 text-sm font-medium shadow-sky-500 enabled:hover:border-sky-500 enabled:hover:bg-sky-500   enabled:hover:text-sky-50 enabled:hover:shadow-sm enabled:focus:border-sky-500 enabled:focus:bg-sky-500 enabled:focus:text-sky-50 enabled:focus:shadow-sm disabled:opacity-50"
                            type="submit"
                            disabled={joinChatroom.isLoading}
                        >
                            {joinChatroom.isLoading ? "Joining..." : "Join!"}
                        </button>
                        {errors.root && (
                            <span className="text-xs font-semibold text-red-500">
                                {errors.root.message}
                            </span>
                        )}
                    </div>
                </form>
            </div>
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
