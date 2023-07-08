export function formatTime(messageDate: Date) {
    const timeNow = new Date();

    const messageTimestampHours = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(messageDate);

    if (timeNow.toDateString() === messageDate.toDateString()) {
        return `Today at ${messageTimestampHours}`;
    }

    timeNow.setDate(timeNow.getDate() - 1);

    if (timeNow.toDateString() === messageDate.toDateString()) {
        return `Yesterday at ${messageTimestampHours}`;
    }

    return `${new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        year: "numeric",
        day: "numeric",
        month: "numeric",
    }).format(messageDate)}`;
}
