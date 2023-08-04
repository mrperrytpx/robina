import { TChatroomInvite } from "../hooks/useGetUserPendingInvitesQuery";
import { VscCheck, VscChromeClose } from "react-icons/vsc";
import { toast } from "react-toastify";
import { useDeclineCharoomInviteMutation } from "../hooks/useDeclineChatroomInviteMutation";
import { useJoinChatroomMutation } from "../hooks/useJoinChatroomMutation";
import { LoadingSpinner } from "./LoadingSpinner";

interface IPendingInviteCardProps {
    chatroom: TChatroomInvite;
}

export const PendingInviteCard = ({ chatroom }: IPendingInviteCardProps) => {
    const joinChatroom = useJoinChatroomMutation();
    const declineInvite = useDeclineCharoomInviteMutation();

    const handleAcceptInvite = async (invite: string) => {
        const response = await joinChatroom.mutateAsync({
            invite,
        });

        if (!response.ok) {
            const error = await response.text();
            toast.error(error);
            return;
        }
    };

    const handleDeclineInvite = async (id: string) => {
        const { response } = await declineInvite.mutateAsync({
            chatId: id,
        });

        if (!response.ok) {
            const error = await response.text();
            toast.error(error);
            return;
        }
    };

    return (
        <div
            key={chatroom.id}
            className="my-1 flex w-full max-w-md items-center justify-between rounded-md border-2 border-glacier-900 bg-white px-2 py-1 text-sm font-medium  transition-all duration-75 focus-within:border-glacier-400 hover:border-glacier-400"
        >
            <span className="truncate">
                <strong className="text-glacier-950">
                    {chatroom.owner.username}
                    &apos;s
                </strong>{" "}
                {chatroom.name}
            </span>
            <div className="flex items-center gap-4">
                <button
                    onClick={() =>
                        handleAcceptInvite(chatroom.invite_link.value)
                    }
                    disabled={joinChatroom.isLoading}
                    aria-label={`Accept invite to a chatroom with the name ${chatroom.name}.`}
                    className="group/button select-none rounded-full p-1 transition-all duration-75 hover:bg-glacier-600 focus:bg-glacier-600"
                >
                    {joinChatroom.isLoading ? (
                        <LoadingSpinner size={20} color="#337387" />
                    ) : (
                        <VscCheck
                            className="fill-glacier-950 group-hover/button:fill-glacier-50 group-focus/button:fill-glacier-50"
                            size={20}
                        />
                    )}
                </button>
                <button
                    onClick={() => handleDeclineInvite(chatroom.id)}
                    disabled={declineInvite.isLoading}
                    className="group/button select-none rounded-full p-1 transition-all duration-75 hover:bg-glacier-600 focus:bg-glacier-600"
                    aria-label={`Decline invite to a chatroom with the name ${chatroom.name}.`}
                >
                    <VscChromeClose
                        className="fill-glacier-950 group-hover/button:fill-glacier-50 group-focus/button:fill-glacier-50"
                        size={20}
                    />
                </button>
            </div>
        </div>
    );
};
