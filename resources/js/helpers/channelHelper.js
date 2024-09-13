export function getChannelName(channel, currentUser) {
    let isDirectChannel = channel.type == "DIRECT";

    if (isDirectChannel) {
        try {
            const user = channel.users.find(
                (user) => user.id != currentUser.id
            );
            return user.name;
        } catch (error) {
            console.error(error);
        }
    }
    return channel.name;
}

export function getDirectChannelUser(channel, currentUser) {
    const user = channel.users.find(
        (user) => user.id != currentUser.id
    );
    return user;
}