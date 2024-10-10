import { useRef } from "react";
import { loadChannelRelatedData } from "./channelDataLoader";
import { setChannelData } from "@/Store/channelsDataSlice";
import { addNewChannelToChannelsStore } from "@/Store/channelsSlice";
import { useSelector } from "react-redux";
const useLoadRelatedChannelData = () => {
    const loadChannelRelatedDataToken = useRef();
    const { channels } = useSelector((state) => state.channels);
    const channelsData = useSelector((state) => state.channelsData);
    return (channelId) => {
        if (loadChannelRelatedDataToken.current)
            loadChannelRelatedDataToken.current.abort();
        loadChannelRelatedDataToken.current = new AbortController();
        return loadChannelRelatedData(
            channelId,
            dispatch,
            setChannelData,
            addNewChannelToChannelsStore,
            channels,
            channelsData,
            loadChannelRelatedDataToken.current
        );
    };
};
export default useLoadRelatedChannelData;
