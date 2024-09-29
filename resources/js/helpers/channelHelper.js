export function getChannelName(channel, channelUsers, currentUser) {
    let isDirectChannel = channel.type == "DIRECT";

    if (isDirectChannel) {
        try {
            const user = channelUsers.find((user) => user.id != currentUser.id);
            return user.display_name || user.name;
        } catch (error) {
            console.error(error);
        }
    }
    return channel.name;
}

export function getDirectChannelUser(channel, workspaceUsers, currentUser) {
    if (!channel || workspaceUsers || currentUser) return null;
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

const channelProps = [
    "channelPermissions",
    "permissions",
    "channelId",
    "managers",
    "messages",
    "channelUsers",
];
export { channelProps };
