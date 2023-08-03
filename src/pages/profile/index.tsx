import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { useDeleteProfileMutation } from "../../hooks/useDeleteProfileMutation";
import { useRouter } from "next/router";
import { useState } from "react";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Portal } from "../../components/Portal";
import { TUsernameFormValues, usernameSchema } from "../force-username";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useUpdateUsernameMutation } from "../../hooks/useUpdateUsernameMutation";
import { useGetUserPendingInvitesQuery } from "../../hooks/useGetUserPendingInvitesQuery";
import { PendingInviteCard } from "../../components/PendingInviteCard";

const ProfilePage = () => {
    const deleteProfile = useDeleteProfileMutation();
    const updateUsername = useUpdateUsernameMutation();
    const pendingInvites = useGetUserPendingInvitesQuery();

    const router = useRouter();
    const session = useSession();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<TUsernameFormValues>({
        resolver: zodResolver(usernameSchema),
        defaultValues: {
            username: session.data?.user.username,
        },
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [err, setErr] = useState("");

    const handleDelete = async () => {
        setIsModalOpen(false);
        const response = await deleteProfile.mutateAsync();

        if (!response?.ok) {
            const error = await response?.text();
            setErr(error);
            return;
        } else {
            router.reload();
        }
    };

    const onSubmit: SubmitHandler<TUsernameFormValues> = async (data) => {
        const response = await updateUsername.mutateAsync({ ...data });

        if (!response?.ok) {
            const error = await response?.text();
            setError("root", { message: error || "Server Error" });
            return;
        } else {
            session.update();
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-screen-md flex-1 flex-col p-2 px-4">
            <form
                className="mt-4 flex w-full flex-col items-center gap-8"
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className="flex w-full flex-col items-center gap-2">
                    <fieldset className="flex w-full flex-col items-center gap-1">
                        <label
                            className="block w-full text-center text-sm sm:w-auto"
                            htmlFor="username"
                            aria-label="username"
                        >
                            <span className="font-bold uppercase">
                                Username:
                            </span>
                        </label>
                        <input
                            style={{
                                borderColor: errors.username
                                    ? "rgb(220 38 38)"
                                    : "black",
                            }}
                            {...register("username")}
                            name="username"
                            id="username"
                            type="text"
                            className="h-10 w-full max-w-md border-b-2 p-2 text-center text-sm font-medium hover:border-sky-500 hover:outline-sky-500 focus:border-white focus:outline-sky-500"
                            placeholder="lazyfox123_"
                            autoComplete="false"
                            maxLength={20}
                            minLength={1}
                        />
                    </fieldset>
                    {errors.username && (
                        <span className="text-xs font-semibold text-red-500">
                            {errors.username.message}
                        </span>
                    )}
                    <p className="w-full text-center text-xs">
                        *Usernames get converted to lowercase letters.
                    </p>
                </div>

                <div className="flex w-full flex-col items-center gap-2">
                    <button
                        className="flex h-10 w-full max-w-md items-center justify-center rounded-md border-2 border-black bg-white p-2 text-sm font-medium shadow-sky-500 enabled:hover:border-sky-500 enabled:hover:bg-sky-500 enabled:hover:text-white enabled:hover:shadow-sm enabled:focus:border-sky-500 enabled:focus:bg-sky-500 enabled:focus:text-white enabled:focus:shadow-sm disabled:opacity-50"
                        type="submit"
                        disabled={updateUsername.isLoading}
                    >
                        {updateUsername.isLoading ? (
                            <LoadingSpinner color="rgb(2 132 199)" size={24} />
                        ) : (
                            "Change username"
                        )}
                    </button>
                    {errors.root && (
                        <span className="text-xs font-semibold text-red-500">
                            {errors.root.message}
                        </span>
                    )}
                </div>
            </form>

            <article className="my-4 flex w-full flex-col items-center gap-1 sm:mt-8">
                <h2 className="text-sm font-bold uppercase">
                    Pending invites:
                </h2>
                {pendingInvites.isLoading ? (
                    <div className="my-1">
                        <LoadingSpinner color="rgb(14 165 233)" size={28} />
                    </div>
                ) : pendingInvites.data?.length ? (
                    pendingInvites.data.map((invitedToChatroom) => (
                        <PendingInviteCard
                            chatroom={invitedToChatroom}
                            key={invitedToChatroom.id}
                        />
                    ))
                ) : (
                    <div className="w-full max-w-md rounded-md p-2 text-center text-sm font-medium">
                        No pending invites 😪
                    </div>
                )}
            </article>

            <article className="mb-4 mt-auto flex w-full flex-col items-center gap-1 sm:mt-8">
                <h2 className="text-sm font-bold uppercase">Account:</h2>

                <button
                    className="flex h-10 w-full max-w-md items-center justify-center rounded-md border-2 border-black bg-white p-2 text-sm font-medium text-black shadow hover:border-red-600 hover:bg-red-600 hover:text-gray-100 focus:border-red-600 focus:bg-red-600 focus:text-gray-100 active:bg-red-600 active:text-gray-100 disabled:opacity-50"
                    onClick={() => setIsModalOpen(!isModalOpen)}
                    disabled={deleteProfile.isLoading}
                >
                    {deleteProfile.isLoading ? (
                        <LoadingSpinner color="rgb(2 132 199)" size={24} />
                    ) : (
                        "Delete Account"
                    )}
                </button>
                {err && (
                    <span className="mt-1 text-xs font-semibold text-red-500">
                        {err}
                    </span>
                )}
            </article>
            {isModalOpen && (
                <Portal setState={setIsModalOpen} shouldRoute={false}>
                    <div className="relative flex max-h-full w-full flex-col items-center gap-8 overflow-y-auto rounded-md border-2 border-white bg-white p-4 text-center text-sm hover:border-sky-500 sm:max-w-md">
                        <h1 className="mb-2 mt-4 text-xl font-bold uppercase sm:mt-0">
                            Are you sure?
                        </h1>
                        <p className="mb-2">
                            This will also delete{" "}
                            <strong className="text-base uppercase text-red-600 underline">
                                all
                            </strong>{" "}
                            of Your sent messages{" "}
                            <strong className="text-base uppercase text-red-600 underline">
                                and
                            </strong>{" "}
                            created chatrooms!
                        </p>
                        <div className="flex w-full items-center justify-center gap-4">
                            <button
                                onClick={handleDelete}
                                className="min-w-[100px] rounded-lg border-2 border-black bg-white p-2 font-semibold uppercase text-black hover:border-red-600 hover:bg-red-600 hover:text-gray-100 hover:shadow-sm focus:bg-red-600 focus:text-gray-100 focus:shadow-sm focus:shadow-red-600 active:bg-red-600 active:text-gray-100"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex h-10 min-w-[100px] items-center justify-center rounded-lg border-2 border-black bg-white p-2 text-sm font-medium uppercase shadow-sky-500 enabled:hover:border-sky-500 enabled:hover:bg-sky-500 enabled:hover:text-white enabled:hover:shadow-sm enabled:focus:border-sky-500 enabled:focus:bg-sky-500 enabled:focus:text-white enabled:focus:shadow-sm disabled:opacity-50"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
};

export default ProfilePage;

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

    return {
        props: { session },
    };
};
