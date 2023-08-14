import { zodResolver } from "@hookform/resolvers/zod";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useUpdateUsernameMutation } from "../../hooks/useUpdateUsernameMutation";
import { useRouter } from "next/router";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { fword, nword } from "../../util/regex";
import Head from "next/head";

export type TUsernameFormValues = z.infer<typeof usernameSchema>;

export const usernameSchema = z.object({
    username: z
        .string()
        .min(2, "Username must be 2 to 20 characters long")
        .max(20, "Username must be 2 to 20 characters long")
        .toLowerCase()
        .trim()
        .refine((val) => !val.match(nword) && !val.match(fword), "Hey! 😡"),
});

const UsernamePage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<TUsernameFormValues>({
        resolver: zodResolver(usernameSchema),
    });

    const router = useRouter();
    const session = useSession();

    const updateUsername = useUpdateUsernameMutation();

    const onSubmit: SubmitHandler<TUsernameFormValues> = async (data) => {
        const response = await updateUsername.mutateAsync({ ...data });

        if (!response?.ok) {
            const error = await response?.text();
            setError("root", { message: error || "Server Error" });
            return;
        } else {
            session.update();
            router.push("/chats");
        }
    };

    return (
        <>
            <Head>
                <title>Choose a username</title>
            </Head>
            <div className="flex w-full max-w-screen-sm flex-1 flex-col items-center p-4 sm:mx-auto sm:my-20 sm:max-w-md">
                <div className="flex w-full max-w-sm flex-col p-2">
                    <h2 className="mb-8 w-full text-center text-xl font-bold uppercase text-glacier-900">
                        Let&apos;s give you a username 😊
                    </h2>
                    <form
                        className="flex w-full flex-col items-center gap-8"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="flex w-full flex-col items-center gap-2">
                            <div className="flex w-full flex-col items-center gap-2 sm:flex-row">
                                <label
                                    className="block w-full text-center text-sm sm:w-auto"
                                    htmlFor="username"
                                    aria-label="username"
                                    aria-hidden="true"
                                />
                                <input
                                    {...register("username")}
                                    name="username"
                                    id="username"
                                    type="text"
                                    className={`h-10 w-full max-w-md border-b-2 border-glacier-900 p-2 text-center text-sm font-medium transition-all duration-75 hover:border-glacier-400 focus:border-glacier-400 focus:outline-glacier-400 ${
                                        errors.username && "border-red-600"
                                    }`}
                                    placeholder="lazyfox123_"
                                    maxLength={20}
                                    minLength={1}
                                />
                            </div>
                            {errors.username && (
                                <span className="text-xs font-semibold text-red-600">
                                    {errors.username.message}
                                </span>
                            )}
                            <p className="w-full text-center text-xs">
                                *Usernames get converted to lowercase letters.
                            </p>
                        </div>

                        <div className="flex w-full flex-col items-center gap-2">
                            <button
                                className="flex h-10 w-full max-w-[15.625rem] select-none items-center justify-center rounded-md border-2 border-glacier-900 bg-white p-2 text-sm font-medium shadow-glacier-600 transition-all duration-75 enabled:hover:border-glacier-600 enabled:hover:bg-glacier-600 enabled:hover:text-white enabled:hover:shadow-sm enabled:focus:border-glacier-600 enabled:focus:bg-glacier-600 enabled:focus:text-white enabled:focus:shadow-sm disabled:border-glacier-200 disabled:bg-glacier-200 disabled:text-glacier-700 disabled:opacity-50"
                                type="submit"
                                disabled={updateUsername.isLoading}
                            >
                                {updateUsername.isLoading ? (
                                    <LoadingSpinner color="#2f5e6f" size={24} />
                                ) : (
                                    "Pick!"
                                )}
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

export default UsernamePage;

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

    if (session.user.username) {
        return {
            redirect: {
                destination: "/chats",
                permanent: false,
            },
        };
    }

    return {
        props: { session },
    };
};
