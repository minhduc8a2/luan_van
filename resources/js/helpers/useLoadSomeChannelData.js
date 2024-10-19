import { setChannelData } from "@/Store/channelsDataSlice";
import { useRef } from "react";
import { useDispatch } from "react-redux";

const useLoadSomeChannelData = (workspaceId) => {
    const tokensRef = useRef(null);
    const dispatch = useDispatch();
    return (channelId, types = []) => {
        if (tokensRef.current) {
            tokensRef.current.map((token) => token.abort());
        }
        tokensRef.current = types.map((i) => new AbortController());
        return Promise.all(
            types.map((type, index) => {
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
                            signal: tokensRef.current[index].signal,
                        }
                    )
                    .then((response) => {
                        dispatch(
                            setChannelData({
                                id: channelId,
                                data: response.data,
                            })
                        );
                    });
            })
        );
    };
};
export default useLoadSomeChannelData;
