import { useSelector } from "react-redux";
import useReloadPermissions from "./useReloadPermissions";

const useReloadLoadedChannelsDataPermissions = (workspaceId) => {
    const reloadPermissions = useReloadPermissions(workspaceId);
    const channelsData = useSelector((state) => state.channelsData);
    const channelIds = Object.keys(channelsData);
    console.log("channelIds: ", channelIds);
    return async () => {
        console.log("in for", channelIds);
        for (let index = 0; index < channelIds.length; index++) {
            console.log("channelsId", channelIds[index]);
            await reloadPermissions(parseInt(channelIds[index]));
        }
    };
};
export default useReloadLoadedChannelsDataPermissions;
