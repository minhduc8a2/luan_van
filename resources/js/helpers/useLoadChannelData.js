import { setChannelData } from "@/Store/channelsDataSlice";
import { useRef } from "react";
import { useDispatch } from "react-redux";

const useLoadChannelData = (workspaceId) => {
    const tokenRef = useRef(null);
    const dispatch = useDispatch();
    return (channelId, type = null) => {
        if (tokenRef.current) {
            tokenRef.current.abort();
        }
        tokenRef.current = new AbortController();
        return axios
            .get(
                route("channels.initChannelData", {
                    workspace: workspaceId,
                    channel: channelId,
                }),
                {
                    params: {
                        only: type,
                    },
                    signal: tokenRef.current.signal,
                }
            )
            .then((response) => {
                dispatch(
                    setChannelData({ id: channelId, data: response.data })
                );
            });
    };
};
export default useLoadChannelData;