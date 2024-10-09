import { setChannelData } from "@/Store/channelsDataSlice";
import { useDispatch } from "react-redux";
import { loadSomeChannelData } from "./channelDataLoader";
import { useRef } from "react";

const useReloadPermissions = () => {
    const dispatch = useDispatch();
    const loadSomeChannelDataToken = useRef([]);
    return (channelId) => {
        if (loadSomeChannelDataToken.current.length > 0)
            loadSomeChannelDataToken.current.forEach((token) => token.abort());
        loadSomeChannelDataToken.current = Array.from(
            { length: 2 },
            () => new AbortController()
        );
        return loadSomeChannelData(
            ["permissions", "channelPermissions"],
            channelId,
            dispatch,
            setChannelData,
            loadSomeChannelDataToken.current
        );
    };
};
export default useReloadPermissions;
