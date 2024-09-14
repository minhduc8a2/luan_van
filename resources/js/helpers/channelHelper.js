export function getChannelName(channel, channelUsers, currentUser) {
    let isDirectChannel = channel.type == "DIRECT";

    if (isDirectChannel) {
        try {
            const user = channelUsers.find((user) => user.id != currentUser.id);
            return user.name;
        } catch (error) {
            console.error(error);
        }
    }
    return channel.name;
}

export function getDirectChannelUser(channel, channelUsers, currentUser) {
    return channelUsers.find((u) => u.id != currentUser.id);
}
