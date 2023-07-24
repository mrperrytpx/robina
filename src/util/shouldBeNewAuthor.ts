import { TChatroomMessage } from "../hooks/useGetChatroomQuery";

export const shouldBeNewAuthor = (
    page: TChatroomMessage[],
    msgIdx: number,
    message: TChatroomMessage
): boolean => {
    if (msgIdx === 0) return false;

    const date1 = new Date(page[msgIdx - 1].created_at || "0").getTime();
    const date2 = new Date(message.created_at).getTime();

    const timeDifference = Math.abs(date2 - date1);

    const minutesDifference = timeDifference / (1000 * 60);

    const areDates10MinutesApart = minutesDifference > 10;

    return (
        msgIdx > 0 &&
        page[msgIdx - 1].author_id === message.author_id &&
        !areDates10MinutesApart
    );
};
