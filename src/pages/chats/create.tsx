import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateChatroomMutation } from "../../hooks/useCreateChatroomMutation";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Chatroom } from "@prisma/client";
import { VscArrowLeft } from "react-icons/vsc";
import Link from "next/link";

export type TCreateChatroomFormValues = z.infer<typeof createChatroomSchema>;

export const createChatroomSchema = z.object({
    name: z
        .string()
        .min(1, "Required")
        .max(50, "Name can't exceed 50 characters"),
    description: z
        .string()
        .min(1, "Required")
        .max(500, "Description cann't exceed 500 characters"),
});

const CreateChatPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
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
            router.push("/chats");
        }
    };

    return (
        <div className="max-w-screen-sm flex-1 rounded-xl bg-white p-4 sm:mx-auto sm:my-20">
            <div className="flex w-full flex-col p-2">
                <Link
                    className="mb-6 flex items-center gap-2 self-start p-2 text-sm font-semibold uppercase antialiased shadow-md"
                    href="/chats"
                >
                    <VscArrowLeft size={40} /> Go Back
                </Link>
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
                        className="h-10 w-full rounded-md border-2 border-black p-2 text-sm font-medium hover:border-sky-500 hover:outline-sky-500 focus:border-sky-500 focus:outline-sky-500"
                        placeholder="Chatroom name"
                    />
                    {errors.name && (
                        <span className="text-xs font-semibold text-red-500">
                            {errors.name.message}
                        </span>
                    )}
                    <label className="block text-xs" htmlFor="description">
                        <strong className="uppercase">
                            Chatroom description
                        </strong>
                    </label>
                    <textarea
                        {...register("description")}
                        name="description"
                        id="description"
                        className="h-44 w-full rounded-md border-2 border-black p-2 text-sm font-medium hover:border-sky-500 hover:outline-sky-500 focus:border-sky-500 focus:outline-sky-500"
                        placeholder="Lorem ipsum dolor sit amet consectetur adipisicing elit."
                    />
                    {errors.description && (
                        <span className="text-xs font-semibold text-red-500">
                            {errors.description.message}
                        </span>
                    )}

                    <button
                        className="h-10 rounded-md border-2 border-black bg-white p-2 text-sm font-medium shadow-sky-500 enabled:hover:border-sky-500 enabled:hover:bg-sky-500   enabled:hover:text-sky-50 enabled:hover:shadow-sm enabled:focus:border-sky-500 enabled:focus:bg-sky-500 enabled:focus:text-sky-50 enabled:focus:shadow-sm disabled:opacity-50"
                        type="submit"
                        disabled={createRoom.isLoading}
                    >
                        {createRoom.isLoading
                            ? "Creating chatroom..."
                            : "Create!"}
                    </button>
                    {errors.root && (
                        <span className="text-xs font-semibold text-red-500">
                            {errors.root.message}
                        </span>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CreateChatPage;
