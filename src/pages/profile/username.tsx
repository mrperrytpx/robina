import { zodResolver } from "@hookform/resolvers/zod";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useUpdateUsernameMutation } from "../../hooks/useUpdateUsernameMutation";
import { useRouter } from "next/router";

export type UsernameFormValues = z.infer<typeof usernameValidationSchema>;

const usernameValidationSchema = z.object({
    username: z
        .string()
        .min(1, "Username must be 1 to 20 characters long")
        .max(20, "Username must be 1 to 20 characters long"),
});

const UsernamePage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<UsernameFormValues>({
        resolver: zodResolver(usernameValidationSchema),
    });

    const router = useRouter();

    const updateUsername = useUpdateUsernameMutation();

    const onSubmit: SubmitHandler<UsernameFormValues> = async (data) => {
        const response = await updateUsername.mutateAsync({ ...data });

        if (!response?.ok) {
            const error = await response?.text();
            setError("root", { message: error || "Server Error" });
            return;
        } else {
            router.push("/chats");
        }
    };

    return (
        <div className="max-w-screen-sm flex-1 sm:mx-auto sm:my-20">
            <form onClick={handleSubmit(onSubmit)}>
                <h2>Let&apos;s give you a username :)</h2>
                <fieldset>
                    <label className="block text-xs" htmlFor="name">
                        <strong className="uppercase">Choose a username</strong>
                    </label>
                    <input
                        {...register("username")}
                        name="username"
                        id="username"
                        type="username"
                        className="h-10 w-full rounded-md border border-slate-500 bg-black p-2 text-sm font-medium focus:bg-slate-200 focus:text-black"
                        placeholder="LazyFox123_"
                    />
                    {errors.username && (
                        <span className="text-xs font-semibold text-red-500">
                            {errors.username.message}
                        </span>
                    )}
                </fieldset>
                <button
                    className="mt-20 rounded-md border border-slate-500 bg-black p-2 font-medium focus:bg-slate-200 focus:text-black disabled:opacity-50"
                    type="submit"
                >
                    Pick
                </button>
                {errors.root && (
                    <span className="text-xs font-semibold text-red-500">
                        {errors.root.message}
                    </span>
                )}
            </form>
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

    return {
        props: { session },
    };
};
