import LoadingSpinner from "@/Components/LoadingSpinner";
import { setNotificationsCount } from "@/Store/activitySlice";
import { setChannels } from "@/Store/channelsSlice";
import { setJoinedChannelIds } from "@/Store/joinedChannelIdsSlice";
import { setWorkspaceData } from "@/Store/workspaceSlice";
import { setWorkspaceUsers } from "@/Store/workspaceUsersSlice";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

export default function InitData({ loaded, setLoaded }) {
    const { workspaceId } = useParams();

    const { newNotificationsCount } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();
    function loadWorkspaceRelatedData() {
        return Promise.all([
            loadWorkspaceUsers(),
            loadChannels(),
            loadWorkspaceData(),
        ]);
    }

    function loadWorkspaceUsers() {
        return axios
            .get(route("users.browseUsers", workspaceId), {
                params: {
                    mode: "all",
                },
            })
            .then((response) => {
                dispatch(setWorkspaceUsers(response.data));
            });
    }
    function loadChannels() {
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
    }
    function loadWorkspaceData() {
        return axios
            .get(route("workspaces.initWorkspaceData", workspaceId))
            .then((response) => {
                dispatch(setWorkspaceData(response.data));
            });
    }

    useEffect(() => {
        setLoaded(false);
        loadWorkspaceRelatedData()
            .then(() => {
                setLoaded(true);

                dispatch(setNotificationsCount(newNotificationsCount));
            })
            .catch((error) => {
                console.log(error);
            });
    }, [workspaceId]);

    // useEffect(() => {
    //     function handleReconnect() {
    //         setLoaded(false);
    //         loadWorkspaceRelatedData()
    //             .then(() => {
    //                 dispatch(setNotificationsCount(newNotificationsCount));
    //             })
    //             .catch((error) => {
    //                 console.log(error);
    //             });
    //     }
    //     Echo.connector.pusher.connection.bind("connected", handleReconnect);
    //     return () => {
    //         Echo.connector.pusher.connection.unbind(
    //             "connected",
    //             handleReconnect
    //         );
    //     };
    // }, [workspaceId]);
    if (loaded) {
        return <></>;
    } else {
        return (
            <div className="fixed top-0 bottom-0 left-0 right-0 flex items-center justify-center bg-background">
                <div className=" ">
                    <div className="relative h-48 w-48">
                        <LoadingSpinner spinerStyle=" border-4  " size="w-24 h-24"/>
                    </div>
                    <p className="animate-bounce text-color-high-emphasis">
                        Loading workspace data ...
                    </p>
                </div>
            </div>
        );
    }
}
