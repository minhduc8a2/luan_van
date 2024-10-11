import axios from "axios";

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

export function findMinMaxId(messages) {
    if (messages.length === 0) {
        return { minId: null, maxId: null };
    }

    return messages.reduce(
        (acc, msg) => {
            if(msg.isTemporary) return acc;
            if (msg.id < acc.minId) acc.minId = msg.id;
            if (msg.id > acc.maxId) acc.maxId = msg.id;
            return acc;
        },
        {
            minId: messages[0].id,
            maxId: messages[0].id,
        }
    );
}

export function loadRegularChannels(workspaceId, channelId) {
    return axios.get(route("workspaces.getRegularChannels", workspaceId), {
        params: { channelId: channelId },
    });
}




