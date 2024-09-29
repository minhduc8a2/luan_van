import { setChannels } from "@/Store/channelsSlice";
import { setWorkspaceUsers } from "@/Store/workspaceUsersSlice";
import { usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function InitData({ loaded, setLoaded }) {
    const { workspace } = usePage().props;
    const dispatch = useDispatch();
    function loadWorkspaceRelatedData() {
        return Promise.all([loadWorkspaceUsers(), loadChannels()]);
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


    useEffect(() => {
        loadWorkspaceRelatedData()
            .then(() => {
                setLoaded(true);
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
