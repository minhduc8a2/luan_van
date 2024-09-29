import { setNotificationsCount } from "@/Store/activitySlice";
import { setChannels } from "@/Store/channelsSlice";
import { setWorkspaceData } from "@/Store/workspaceSlice";
import { setWorkspaceUsers } from "@/Store/workspaceUsersSlice";
import { usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function InitData({ loaded, setLoaded }) {
    const { workspace } = usePage().props;
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
            .get(route("users.browseUsers", workspace.id), {
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
            .get(route("workspaces.getChannels", workspace.id))
            .then((response) => {
                dispatch(setChannels(response.data));
            });
    }
    function loadWorkspaceData() {
        return axios
            .get(route("workspaces.initWorkspaceData", workspace.id))
            .then((response) => {
                dispatch(setWorkspaceData(response.data));
            });
    }

    useEffect(() => {
        loadWorkspaceRelatedData()
            .then(() => {
                setLoaded(true);

                dispatch(setNotificationsCount(newNotificationsCount));
            })
            .catch((error) => {
                console.log(error);
            });
    }, [workspace.id]);
    if (loaded) {
        return <></>;
    } else {
        return <div className="">Loading workspace data</div>;
    }
}
