export function getChannelName(channel,currentUser, workspaceUsers) {
    let isDirectChannel = channel.type == "DIRECT";

    if (isDirectChannel) {
        try {
            const userId = channel.name
                .split("_")
                .find((id) => id != currentUser.id);

            const user = workspaceUsers.find((user) => user.id == userId);
            return user.name;
        } catch (error) {
            console.error(error);
        }
    }
    return channel.name;
}
