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

export function getDirectChannelUser(channel, channelUsers, currentUser) {
    return channelUsers.find((u) => u.id != currentUser.id);
}

export function getDirectChannelFromUserId(directChannels, userId) {
    try {
        return directChannels.find((channel) => {
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
    "channel",
    "managers",
    "messages",
    "channelUsers",
];
export { channelProps };
