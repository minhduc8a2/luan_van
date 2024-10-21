import useLoadSomeChannelData from "./useLoadSomeChannelData";

const useReloadPermissions = (workspaceId) => {
    const loadSomeChannelData = useLoadSomeChannelData(workspaceId);
    return (channelId) => {
        if (!channelId) return Promise.resolve();
        return loadSomeChannelData(channelId, [
            "permissions",
            "channelPermissions",
        ]);
    };
};
export default useReloadPermissions;
