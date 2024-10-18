import useLoadSomeChannelData from "./useLoadSomeChannelData";

const useReloadPermissions = (workspaceId) => {
    const loadSomeChannelData = useLoadSomeChannelData(workspaceId);
    return (channelId) => {
        return loadSomeChannelData(channelId, [
            "permissions",
            "channelPermissions",
        ]);
    };
};
export default useReloadPermissions;
