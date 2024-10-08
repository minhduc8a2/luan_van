import { loadChannelRelatedData } from "@/helpers/channelDataLoader";
import { setChannelData } from "@/Store/channelsDataSlice";
import { addNewChannelToChannelsStore } from "@/Store/channelsSlice";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

export default function InitData({ loaded, setLoaded }) {
    const { channelId } = useParams();
    const { channels } = useSelector((state) => state.channels);
    const channelsData = useSelector((state) => state.channelsData);
    const loadChannelDataToken = useRef(null);
    const loadChannelMessagesToken = useRef(null);
    const loadChannelIfNotExistsToken = useRef(null);

    const dispatch = useDispatch();

    function init() {
        setLoaded(false);

        if (loadChannelDataToken.current) {
            loadChannelDataToken.current.abort();
        }
        if (loadChannelMessagesToken.current) {
            loadChannelMessagesToken.current.abort();
        }
        if (loadChannelIfNotExistsToken.current) {
            loadChannelIfNotExistsToken.current.abort();
        }
        loadChannelDataToken.current = new AbortController();
        loadChannelMessagesToken.current = new AbortController();
        loadChannelIfNotExistsToken.current = new AbortController();
        loadChannelRelatedData(
            channelId,
            dispatch,
            setChannelData,
            addNewChannelToChannelsStore,
            channels,
            channelsData,
            [
                loadChannelDataToken.current,
                loadChannelMessagesToken.current,
                loadChannelIfNotExistsToken.current,
            ]
        )
            .then(() => {
                setLoaded(true);
            })
            .catch((error) => {
                console.log(error);
            });
    }
    useEffect(() => {
        init();
    }, [channelId]);

    return <></>;
}
