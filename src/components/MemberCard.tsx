import Image from "next/image";
import DefaultPic from "../../public/default-lightbg.png";
import { useSession } from "next-auth/react";
import { User } from "@prisma/client";
import { VscCircleSlash } from "react-icons/vsc";
import { LoadingSpinner } from "./LoadingSpinner";

interface IMemberCardProps {
    member: User;
    onClick?: () => Promise<void>;
    ownerId: string;
    loading?: boolean;
    opaque?: boolean;
}

export const SkeletonLoadingCard = () => {
    return (
        <div
            aria-label="Loading chatroom member card."
            className="group relative flex items-center gap-2 rounded-md border-2 border-white bg-white p-2 shadow hover:border-glacier-900"
        >
            <div className="aspect-square w-8 animate-pulse rounded-full bg-glacier-200" />
            <div className="h-5 w-full animate-pulse bg-glacier-200" />
        </div>
    );
};

export const MemberCard = ({
    member,
    onClick,
    ownerId,
    loading,
    opaque,
}: IMemberCardProps) => {
    const session = useSession();

    return (
        <div className="group relative flex items-center gap-2 rounded-md border-2 border-white bg-white px-2 py-1 shadow hover:border-glacier-900">
            <div
                className="aspect-square w-8"
                style={{ opacity: opaque ? "0.6" : "1" }}
            >
                <Image
                    src={member.image ?? DefaultPic}
                    alt={`${member.username}'s image`}
                    width={100}
                    height={100}
                    className="w-full min-w-[2rem] select-none rounded-full"
                />
            </div>
            <span
                style={{
                    fontWeight: member.id === ownerId ? "bold" : "",
                    opacity: opaque ? "0.6" : "1",
                }}
                className="truncate text-sm"
            >
                @{member.username}
                {member.id === ownerId && " - 🦁"}
            </span>
            {member.id !== ownerId && session.data?.user.id === ownerId && (
                <button
                    onClick={onClick}
                    className="absolute right-1 top-1/2 hidden -translate-y-1/2 cursor-pointer select-none rounded-lg bg-white p-1 group-target:block group-hover:block"
                    disabled={loading}
                    aria-label="Ban or unban member depending where the card is rendered."
                >
                    {loading ? (
                        <LoadingSpinner size={28} color="#2f5e6f" />
                    ) : (
                        <VscCircleSlash className="h-7 w-7 fill-red-600" />
                    )}
                </button>
            )}
        </div>
    );
};
