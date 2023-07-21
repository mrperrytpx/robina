import Image from "next/image";
import DefaultPic from "../../public/default.png";
import { useSession } from "next-auth/react";
import { User } from "@prisma/client";
import { VscCircleSlash } from "react-icons/vsc";

interface IMemberCardProps {
    member: User;
    onClick?: () => Promise<void>;
    ownerId: string;
}

export const SkeletonLoadingCard = () => {
    return (
        <div className="group relative flex items-center gap-2 rounded-md border-2 border-white bg-white p-2 shadow hover:border-black focus:bg-slate-900 active:bg-slate-900">
            <div className="aspect-square w-8 animate-pulse rounded-full bg-gray-300" />
            <div className="h-5 w-full animate-pulse bg-gray-300" />
        </div>
    );
};

export const MemberCard = ({ member, onClick, ownerId }: IMemberCardProps) => {
    const session = useSession();

    return (
        <div className="group relative flex items-center gap-2 rounded-md border-2 border-white bg-white p-2 shadow hover:border-black focus:bg-slate-900 active:bg-slate-900">
            <div className="aspect-square w-8">
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
                >
                    <VscCircleSlash size={28} fill="red" />
                </button>
            )}
        </div>
    );
};
