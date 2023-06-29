import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateChatroomMutation } from "../../hooks/useCreateChatroomMutation";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";

export type FormValues = z.infer<typeof validationSchema>;

const validationSchema = z.object({
    name: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    isPublic: z.boolean().optional(),
});

const CreateChatPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<FormValues>({
        resolver: zodResolver(validationSchema),
    });

    const router = useRouter();

    const createRoom = useCreateChatroomMutation();

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        const response = await createRoom.mutateAsync({ ...data });

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
            <form
                className="flex flex-col gap-2"
                onSubmit={handleSubmit(onSubmit)}
            >
                <label className="block text-xs" htmlFor="name">
                    <strong className="uppercase">Chatroom name</strong>
                </label>
                <input
                    {...register("name")}
                    name="name"
                    id="name"
                    type="name"
                    className="h-10 w-full rounded-md border border-slate-500 bg-black p-2 text-sm font-medium focus:bg-slate-200 focus:text-black"
                    placeholder="Chatroom name"
                />
                {errors.name && (
                    <span className="text-xs font-semibold text-red-500">
                        {errors.name.message}
                    </span>
                )}
                {/*  */}
                <label className="block text-xs" htmlFor="description">
                    <strong className="uppercase">Chatroom description</strong>
                </label>
                <textarea
                    {...register("description")}
                    name="description"
                    id="description"
                    className="h-44 w-full rounded-md border border-slate-500 bg-black p-2 text-sm font-medium focus:bg-slate-200 focus:text-black"
                    placeholder="Lorem ipsum dolor sit amet consectetur adipisicing elit."
                />
                {errors.description && (
                    <span className="text-xs font-semibold text-red-500">
                        {errors.description.message}
                    </span>
                )}
                {/*  */}
                <div className="flex items-center justify-between">
                    <label className="block flex-1 text-xs" htmlFor="isPublic">
                        <strong className="uppercase">
                            Should the chatroom be public?
                        </strong>
                    </label>
                    <input
                        {...register("isPublic")}
                        type="checkbox"
                        name="isPublic"
                        id="isPublic"
                        className="aspect-square w-10"
                    />
                </div>
                {errors.isPublic && (
                    <span className="text-xs font-semibold text-red-500">
                        {errors.isPublic.message}
                    </span>
                )}

                <button
                    className="mt-4 rounded-md border border-slate-500 bg-black p-2 font-medium focus:bg-slate-200 focus:text-black disabled:opacity-50"
                    type="submit"
                    disabled={createRoom.isLoading}
                >
                    {createRoom.isLoading ? "Creating chatroom..." : "Create!"}
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

export default CreateChatPage;

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
