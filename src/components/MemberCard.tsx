import Image from "next/image";
import DefaultPic from "../../public/default.png";
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
            className="group relative flex items-center gap-2 rounded-md border-2 border-white bg-white p-2 shadow hover:border-black"
        >
            <div className="aspect-square w-8 animate-pulse rounded-full bg-gray-300" />
            <div className="h-5 w-full animate-pulse bg-gray-300" />
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
        <div className="group relative flex items-center gap-2 rounded-md border-2 border-white bg-white p-2 shadow hover:border-black">
            <div
                className="aspect-square w-8"
                style={{ opacity: opaque ? "0.6" : "1" }}
            >
                <Image
                    src={member.image ?? DefaultPic}
                    alt={`${member.username}'s image`}
                    width={100}
                    height={100}
                    className="w-full min-w-[32px] rounded-full"
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
                    className="absolute right-1 top-1/2 hidden -translate-y-1/2 cursor-pointer rounded-lg bg-white p-1 group-target:block group-hover:block"
                    disabled={loading}
                    aria-label="Ban or unban member depending where the card is rendered."
                >
                    {loading ? (
                        <LoadingSpinner size={28} color="rgb(220 38 38)" />
                    ) : (
                        <VscCircleSlash size={28} fill="rgb(220 38 38)" />
                    )}
                </button>
            )}
        </div>
    );
};
