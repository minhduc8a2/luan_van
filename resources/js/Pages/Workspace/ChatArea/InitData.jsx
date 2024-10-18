import useLoadChannelIfNotExists from "@/helpers/useLoadChannelIfNotExists";
import useLoadChannelRelatedData from "@/helpers/useLoadRelatedChannelData";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

export default function InitData({ loaded, setLoaded }) {
    const { channelId, workspaceId } = useParams();
    const loadChannelRelatedData = useLoadChannelRelatedData(workspaceId);
    const loadChannelIfNotExists = useLoadChannelIfNotExists(workspaceId);
    const channelsData = useSelector((state) => state.channelsData);
    const makePromise = () => {
        if (channelsData.hasOwnProperty(channelId))
            return loadChannelIfNotExists(channelId);
        else return loadChannelRelatedData(channelId);
    };
    function init() {
        setLoaded(false);
        makePromise()
            .then(() => {
                setLoaded(true);
            })
            .catch((error) => {
                console.log(error);
            });
    }
    useEffect(() => {
        console.log("Init channel data running");
        init();
    }, [channelId]);

    return <></>;
}
