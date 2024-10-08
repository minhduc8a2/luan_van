export function getChannelName(channel, workspaceUsers, currentUser) {
    let isDirectChannel = channel.type == "DIRECT";
    if (!isDirectChannel) return channel.name;

    try {
        const user = getDirectChannelUser(channel, workspaceUsers, currentUser);

        return user?.display_name || user?.name || "Name not found";
    } catch (error) {
        console.error(error);
    }
}

export function getDirectChannelUser(channel, workspaceUsers, currentUser) {
    if (!channel || !workspaceUsers || !currentUser) return null;
    try {
        const userIds = channel?.name.split("_");
        const userId = userIds.find((id) => id != currentUser.id);
        return workspaceUsers.find((user) => user.id == userId);
    } catch (error) {
        console.error(error);
    }
    return null;
}

export function getDirectChannelFromUserId(channels, userId) {
    try {
        return channels.find((channel) => {
            if (channel.type != "DIRECT") return false;
            const userIds = channel.name.split("_");
            return userIds.find((id) => userId == id) != null;
        });
    } catch (error) {
        console.error(error);
    }

    return null;
}

export function findMinMaxCreatedAt(messages) {
    if (messages.length === 0) {
        return { minCreatedAt: null, maxCreatedAt: null };
    }

    return messages.reduce(
        (acc, msg) => {
            if (
                new Date(msg.created_at).getTime() <
                new Date(acc.minCreatedAt).getTime()
            )
                acc.minCreatedAt = msg.created_at;
            if (
                new Date(msg.created_at).getTime() >
                new Date(acc.maxCreatedAt).getTime()
            )
                acc.maxCreatedAt = msg.created_at;
            return acc;
        },
        {
            minCreatedAt: messages[0].created_at,
            maxCreatedAt: messages[0].created_at,
        }
    );
}

const channelProps = [
    "channelPermissions",
    "permissions",
    "channelId",
    "managers",
    "messages",
    "channelUsers",
];
export { channelProps };
