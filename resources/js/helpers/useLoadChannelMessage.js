import { setChannelData } from "@/Store/channelsDataSlice";
import { useRef } from "react";
import { useDispatch } from "react-redux";

const useLoadChannelMessages = (workspaceId) => {
    const tokenRef = useRef(null);
    const dispatch = useDispatch();
    return (channelId) => {
        if (tokenRef.current) {
            tokenRef.current.abort();
        }
        tokenRef.current = new AbortController();
        return axios
            .get(
                route("messages.infiniteMessages", {
                    workspace: workspaceId,
                    channel: channelId,
                }),
                {
                    signal: tokenRef.current.signal,
                }
            )
            .then((response) => {
                dispatch(
                    setChannelData({
                        id: channelId,
                        data: { messages: response.data },
                    })
                );
            });
    };
};
export default useLoadChannelMessages;
