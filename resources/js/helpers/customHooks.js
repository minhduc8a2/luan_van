import { useSelector } from "react-redux";
import { useMemo } from "react";
const useChannelData = (channelId) => {
    const channelsData = useSelector((state) => state.channelsData);

    return (
        (channelsData.hasOwnProperty(channelId) && channelsData[channelId]) || {
            permissions: {},
            messages: [],
            channelPermissions: [],
            channelUserIds: [],
            managerIds: [],
        }
    );
};

const useManagers = (channelId) => {
    const { managerIds } = useChannelData(channelId);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);

    const managers = useMemo(() => {
        if (!managerIds.length || !workspaceUsers.length) {
            return [];
        }

        return workspaceUsers.filter((user) =>
            managerIds.some((id) => user.id === id)
        );
    }, [managerIds, workspaceUsers]);
    return { managers };
};

const useChannelUsers = (channelId) => {
    const { channelUserIds } = useChannelData(channelId);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);

    const channelUsers = useMemo(() => {
        if (!channelUserIds.length || !workspaceUsers.length) {
            return [];
        }
        return workspaceUsers.filter((user) =>
            channelUserIds.some((id) => user.id === id)
        );
    }, [channelUserIds, workspaceUsers]);
    return { channelUsers };
};
const useChannel = (channelId) => {
    const { channels } = useSelector((state) => state.channels);

    const channel = useMemo(() => {
        return channels.find((cn) => cn.id === channelId) || null; // Return null if not found
    }, [channels, channelId]);

    return {
        channel,
    };
};

export { useChannelData, useManagers, useChannel, useChannelUsers };
