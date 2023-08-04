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
        formState: { errors, isSubmitting },
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
            <div className="mt-4 flex w-full flex-col items-center gap-8">
                <div className="flex w-full flex-col items-center gap-2">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex w-full flex-col items-center gap-1"
                    >
                        <label
                            className="block w-full text-center text-sm font-bold uppercase text-glacier-900 sm:w-auto"
                            htmlFor="username"
                            aria-label="username"
                        >
                            Username:
                        </label>
                        <input
                            {...register("username")}
                            name="username"
                            id="username"
                            type="text"
                            className={`h-10 w-full max-w-md border-b-2 border-glacier-900 p-2 text-center text-sm font-medium transition-all duration-75 hover:border-glacier-400 focus:border-glacier-400 focus:outline-glacier-400 ${
                                errors.username && "border-red-600"
                            }`}
                            placeholder="lazyfox123_"
                            autoComplete="false"
                            maxLength={20}
                            minLength={1}
                        />
                        {errors.username && (
                            <span className="mt-1 text-xs font-semibold text-red-600">
                                {errors.username.message}
                            </span>
                        )}
                        {errors.root && (
                            <span className="mt-1 text-xs font-semibold text-red-600">
                                {errors.root.message}
                            </span>
                        )}
                        <div className="mt-1 flex w-full flex-col items-center gap-2">
                            <button
                                className="flex h-10 w-full max-w-md select-none items-center justify-center rounded-md border-2 border-glacier-900 bg-white p-2 text-sm font-medium text-glacier-900 shadow-glacier-600 transition-all duration-75 enabled:hover:border-glacier-600 enabled:hover:bg-glacier-600 enabled:hover:text-white enabled:hover:shadow enabled:focus:border-glacier-600 enabled:focus:bg-glacier-600 enabled:focus:text-white enabled:focus:shadow disabled:border-0 disabled:bg-glacier-200 disabled:text-glacier-700 disabled:opacity-50"
                                type="submit"
                                disabled={
                                    updateUsername.isLoading || isSubmitting
                                }
                            >
                                {updateUsername.isLoading ? (
                                    <LoadingSpinner color="#2f5e6f" size={24} />
                                ) : (
                                    "Change username"
                                )}
                            </button>
                        </div>
                    </form>

                    <p className="w-full text-center text-xs font-medium">
                        *Usernames get converted to lowercase letters.
                    </p>
                </div>
            </div>

            <article className="my-4 flex w-full flex-col items-center gap-1 sm:mt-8">
                <h2 className="text-sm font-bold uppercase text-glacier-900">
                    Pending invites:
                </h2>
                {pendingInvites.isLoading ? (
                    <div className="my-1">
                        <LoadingSpinner color="#337387" size={28} />
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
                    className="flex h-10 w-full max-w-md select-none items-center justify-center rounded-md border-2 border-black bg-white p-2 text-sm font-medium text-black shadow transition-all duration-75 hover:border-red-600 hover:bg-red-600 hover:text-glacier-50 focus:border-red-600 focus:bg-red-600 focus:text-glacier-50 active:bg-red-600 active:text-glacier-50 disabled:opacity-50"
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
                    <div className="relative flex max-h-full w-full flex-col items-center gap-8 overflow-y-auto rounded-lg border-2 border-white bg-white p-4 text-center text-sm hover:border-glacier-600 sm:max-w-md">
                        <h1 className="mb-2 mt-4 text-xl font-bold uppercase text-glacier-900 sm:mt-0">
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
                                className="min-w-[100px] select-none rounded-lg border-2 border-black bg-white p-2 font-semibold uppercase text-black transition-all duration-75 hover:border-red-600 hover:bg-red-600 hover:text-glacier-50 hover:shadow-sm focus:bg-red-600 focus:text-glacier-50 focus:shadow-sm focus:shadow-red-600 active:bg-red-600 active:text-glacier-50"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="min-w-[100px] select-none rounded-lg border-2 border-black bg-white p-2 font-semibold uppercase text-black transition-all duration-75 hover:border-glacier-600 hover:bg-glacier-600 hover:text-glacier-50 hover:shadow-sm focus:bg-glacier-600 focus:text-glacier-50 focus:shadow-sm focus:shadow-glacier-600 active:bg-glacier-600 active:text-glacier-50"
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
