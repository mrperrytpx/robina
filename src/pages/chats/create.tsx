import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateChatroomMutation } from "../../hooks/useCreateChatroomMutation";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { VscArrowLeft } from "react-icons/vsc";
import Head from "next/head";

export type TCreateChatroomFormValues = z.infer<typeof createChatroomSchema>;

export const createChatroomSchema = z.object({
    name: z
        .string()
        .min(1, "Required")
        .max(50, "Name can't exceed 50 characters"),
    description: z
        .string()
        .min(2, "Required")
        .max(500, "Description cann't exceed 500 characters"),
});

const CreateChatPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        reset,
    } = useForm<TCreateChatroomFormValues>({
        resolver: zodResolver(createChatroomSchema),
    });

    const router = useRouter();
    const createRoom = useCreateChatroomMutation();

    const onSubmit: SubmitHandler<TCreateChatroomFormValues> = async (data) => {
        const response = await createRoom.mutateAsync({ ...data });

        if (!response?.ok) {
            const error = await response?.text();
            setError("root", { message: error || "Server Error" });
            return;
        } else {
            reset();
            router.push("/chats");
        }
    };

    return (
        <>
            <Head>
                <title>Create a chatroom</title>
                <meta
                    name="description"
                    content="Create your own chatroom."
                    key="description"
                />
                <meta
                    property="og:description"
                    content="Create your own chatroom."
                    key="og-description"
                />
                <meta
                    property="og:title"
                    content="YetAnotherMessagingApp - Create a Chatroom"
                    key="title"
                />
                <meta
                    property="og:url"
                    content={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/chats/create`}
                    key="url"
                />
            </Head>
            <div className="max-w-screen-sm flex-1 bg-glacier-50 p-4 sm:mx-auto sm:my-20 sm:rounded-xl">
                <div className="flex w-full flex-col p-2">
                    <button
                        onClick={() => router.back()}
                        className="group mb-6 flex select-none items-center gap-1 self-start rounded-md border-2 border-glacier-900 bg-white px-2 py-1 text-sm font-semibold uppercase text-glacier-900 antialiased transition-all duration-75 hover:border-glacier-600 hover:bg-glacier-600 hover:text-glacier-50 focus:border-glacier-600 focus:bg-glacier-600 focus:text-glacier-50 "
                    >
                        <VscArrowLeft className="h-8 w-8 group-hover:fill-glacier-50 group-focus:fill-glacier-50" />{" "}
                        Go Back
                    </button>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="flex w-full flex-col gap-0.5">
                            <label
                                className="block text-xs text-glacier-900"
                                htmlFor="name"
                            >
                                <strong className="uppercase">
                                    Chatroom name
                                </strong>
                            </label>
                            <input
                                {...register("name")}
                                name="name"
                                id="name"
                                type="text"
                                className={`focus:border-glacier-00 h-10 w-full rounded-md border-2 border-glacier-900 p-2 text-sm font-medium transition-all duration-75 hover:border-glacier-400 focus:outline-glacier-400 ${
                                    errors.name && "border-red-600"
                                }`}
                                placeholder="Chatroom name"
                                maxLength={50}
                                minLength={1}
                            />
                            {errors.name && (
                                <span className="text-xs font-semibold text-red-600">
                                    {errors.name.message}
                                </span>
                            )}
                        </div>
                        <div className="flex w-full flex-col gap-0.5">
                            <label
                                className="block text-xs text-glacier-900"
                                htmlFor="description"
                            >
                                <strong className="uppercase">
                                    Chatroom description
                                </strong>
                            </label>
                            <textarea
                                {...register("description")}
                                name="description"
                                id="description"
                                className={`h-44 w-full rounded-md border-2 border-glacier-900 p-2 text-sm font-medium transition-all duration-75 hover:border-glacier-400 focus:border-glacier-400 focus:outline-glacier-400 ${
                                    errors.description && "border-red-600"
                                }`}
                                placeholder="Lorem ipsum dolor sit amet consectetur adipisicing elit."
                                maxLength={500}
                                minLength={1}
                            />
                            {errors.description && (
                                <span className="text-xs font-semibold text-red-600">
                                    {errors.description.message}
                                </span>
                            )}
                        </div>

                        <button
                            className="h-10 select-none rounded-md border-2 border-glacier-900 bg-white p-2 text-sm font-medium shadow-glacier-600 transition-all duration-75 enabled:hover:border-glacier-600 enabled:hover:bg-glacier-600 enabled:hover:text-glacier-50 enabled:hover:shadow enabled:focus:border-glacier-600 enabled:focus:bg-glacier-600 enabled:focus:text-glacier-50 enabled:focus:shadow-sm disabled:border-glacier-200 disabled:bg-glacier-200 disabled:text-glacier-700 disabled:opacity-50"
                            type="submit"
                            disabled={createRoom.isLoading}
                        >
                            {createRoom.isLoading
                                ? "Creating chatroom..."
                                : "Create!"}
                        </button>
                        {errors.root && (
                            <span className="text-center text-xs font-semibold text-red-600">
                                {errors.root.message}
                            </span>
                        )}
                    </form>
                </div>
            </div>
        </>
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
                destination: `/signin?callbackUrl=${encodeURIComponent(
                    process.env.NEXTAUTH_URL + ctx.resolvedUrl
                )}`,
                permanent: false,
            },
        };
    }

    if (!session.user.username) {
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
