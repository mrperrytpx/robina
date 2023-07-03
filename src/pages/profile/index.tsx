import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { useDeleteProfileMutation } from "../../hooks/useDeleteProfileMutation";
import { useRouter } from "next/router";

const ProfilePage = () => {
    const deleteProfile = useDeleteProfileMutation();
    const router = useRouter();

    const handleDelete = async () => {
        const response = await deleteProfile.mutateAsync();

        if (!response?.ok) {
            const error = await response?.text();
            return;
        } else {
            router.reload();
        }
    };

    return (
        <div>
            Profile Page
            <button onClick={handleDelete}>Delete user</button>
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
