import { addNewChannelToChannelsStore } from "@/Store/channelsSlice";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

const useLoadChannelIfNotExists = (workspaceId) => {
    const tokenRef = useRef(null);
    const dispatch = useDispatch();
    const { channels } = useSelector((state) => state.channels);
    return (channelId) => {
        if (tokenRef.current) {
            tokenRef.current.abort();
        }
        tokenRef.current = new AbortController();
        if (channels.some((cn) => cn.id == channelId)) return Promise.resolve();

        return axios
            .get(
                route("channels.initChannelData", {
                    workspace: workspaceId,
                    channel: channelId,
                }),
                {
                    params: {
                        only: "channel",
                    },
                    signal: tokenRef.current.signal,
                }
            )
            .then((response) => {
                dispatch(addNewChannelToChannelsStore(response.data.channel));
            });
    };
};
export default useLoadChannelIfNotExists;
