import { setNotificationsCount } from "@/Store/activitySlice";
import { setChannels } from "@/Store/channelsSlice";
import { setWorkspaceData } from "@/Store/workspaceSlice";
import { setWorkspaceUsers } from "@/Store/workspaceUsersSlice";
import { usePage } from "@inertiajs/react";
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
        return <div className="">Loading workspace data</div>;
    }
}
