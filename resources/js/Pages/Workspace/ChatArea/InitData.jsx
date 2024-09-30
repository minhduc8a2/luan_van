import { setchannelData } from "@/Store/channelsDataSlice";
import { usePage } from "@inertiajs/react";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function InitData({ loaded, setLoaded }) {
    const { workspace, channelId } = usePage().props;
    const channelsData = useSelector((state) => state.channelsData);
    const loadChannelDataToken = useRef(null);
    const loadChannelMessagesToken = useRef(null);
    const dispatch = useDispatch();
    function loadChannelRelatedData() {
        return Promise.all([loadChannelData(), loadChannelMessages()]);
    }

    function loadChannelData() {
        loadChannelDataToken.current = new AbortController();
        return axios
            .get(
                route("channels.initChannelData", {
                    channel: channelId,
                }),
                {
                    signal: loadChannelDataToken.current.signal,
                }
            )
            .then((response) => {
                dispatch(
                    setchannelData({ id: channelId, data: response.data })
                );
            });
    }
    function loadChannelMessages() {
        loadChannelMessagesToken.current = new AbortController();
        return axios
            .get(
                route("messages.infiniteMessages", {
                   
                    channel: channelId,
                }),
                {
                    signal: loadChannelMessagesToken.current.signal,
                }
            )
            .then((response) => {
                dispatch(
                    setchannelData({
                        id: channelId,
                        data: { messages: response.data },
                    })
                );
            });
    }
    useEffect(() => {
        setLoaded(false);
        if (channelsData[channelId]) {
            setLoaded(true);
            return;
        }
        loadChannelRelatedData()
            .then(() => {
                setLoaded(true);
            })
            .catch((error) => {
                console.log(error);
            });
        // return () => {
        //     if (loadChannelDataToken.current) {
        //         loadChannelDataToken.current.abort();
        //     }
        //     if (loadChannelMessagesToken.current) {
        //         loadChannelMessagesToken.current.abort();
        //     }
        // };
    }, [channelId]);
    if (loaded) {
        return <></>;
    } else {
        return <div className="">Loading channel data</div>;
    }
}
