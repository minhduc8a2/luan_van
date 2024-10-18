import useLoadChannelData from "./useLoadChannelData";
import useLoadChannelIfNotExists from "./useLoadChannelIfNotExists";
import useLoadChannelMessages from "./useLoadChannelMessage";

const useLoadRelatedChannelData = (workspaceId) => {
    const loadChannelData = useLoadChannelData(workspaceId);
    const loadChannelIfNotExists = useLoadChannelIfNotExists(workspaceId);
    const loadChannelMessages = useLoadChannelMessages(workspaceId);
    return (channelId) => {
        return Promise.all([
            loadChannelData(channelId),
            loadChannelMessages(channelId),
            loadChannelIfNotExists(channelId),
        ]);
    };
};
export default useLoadRelatedChannelData;
