import { zodResolver } from "@hookform/resolvers/zod";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useUpdateUsernameMutation } from "../../hooks/useUpdateUsernameMutation";
import { useRouter } from "next/router";
import { LoadingSpinner } from "../../components/LoadingSpinner";

export type TUsernameFormValues = z.infer<typeof usernameSchema>;

export const usernameSchema = z.object({
    username: z
        .string()
        .min(1, "Username must be 1 to 20 characters long")
        .max(20, "Username must be 1 to 20 characters long")
        .toLowerCase()
        .trim(),
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
        <div className="flex w-full max-w-screen-sm flex-1 flex-col items-center rounded-xl bg-white p-4 sm:mx-auto sm:my-20 sm:max-w-md">
            <div className="flex w-full max-w-sm flex-col p-2">
                <h2 className="mb-8 w-full text-center text-xl font-bold uppercase">
                    Let&apos;s give you a username 😊
                </h2>
                <form
                    className="flex w-full flex-col items-center gap-8"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="flex w-full flex-col items-center gap-2">
                        <div className="flex w-full items-center gap-2">
                            <label className="block text-sm" htmlFor="username">
                                <strong className="uppercase">
                                    Username:*
                                </strong>
                            </label>
                            <input
                                {...register("username")}
                                name="username"
                                id="username"
                                type="text"
                                className="h-10 flex-1 border-b-2 border-black p-2 text-sm font-medium hover:border-sky-500 hover:outline-sky-500 focus:border-white focus:outline-sky-500"
                                placeholder="lazyfox123_"
                            />
                        </div>
                        {errors.username && (
                            <span className="text-xs font-semibold text-red-500">
                                {errors.username.message}
                            </span>
                        )}
                        <p className="w-full text-left text-xs">
                            *Usernames get converted to lowercase letters.
                        </p>
                    </div>

                    <div className="flex w-full flex-col items-center gap-2">
                        <button
                            className="flex h-10 w-full max-w-[250px] items-center justify-center rounded-md border-2 border-black bg-white p-2 text-sm font-medium shadow-sky-500 enabled:hover:border-sky-500 enabled:hover:bg-sky-500   enabled:hover:text-sky-50 enabled:hover:shadow-sm enabled:focus:border-sky-500 enabled:focus:bg-sky-500 enabled:focus:text-sky-50 enabled:focus:shadow-sm disabled:opacity-50"
                            type="submit"
                            disabled={updateUsername.isLoading}
                        >
                            {updateUsername.isLoading ? (
                                <LoadingSpinner
                                    color="rgb(2 132 199)"
                                    size={24}
                                />
                            ) : (
                                "Pick!"
                            )}
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

export default UsernamePage;

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
