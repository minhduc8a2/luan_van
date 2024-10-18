import { setChannels } from "@/Store/channelsSlice";
import { setJoinedChannelIds } from "@/Store/joinedChannelIdsSlice";
import { useRef } from "react";
import { useDispatch } from "react-redux";

const useLoadChannels = (workspaceId) => {
    const tokenRef = useRef(null);
    const dispatch = useDispatch();
    return () => {
        if (tokenRef.current) {
            tokenRef.current.abort();
        }
        tokenRef.current = new AbortController();
        return axios
            .get(route("workspaces.getChannels", workspaceId))
            .then((response) => {
                dispatch(setChannels(response.data));
                const channelIds = response.data.reduce(
                    (pre, cn) => [...pre, cn.id],
                    []
                );
                dispatch(setJoinedChannelIds({ data: channelIds }));
            });
    };
};
export default useLoadChannels;
