import { setNotificationsCount } from "@/Store/activitySlice";
import { setWorkspaceData } from "@/Store/workspaceSlice";
import { useRef } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

const useLoadWorkspaceData = () => {
    const dispatch = useDispatch();
    const { workspaceId } = useParams();
    const tokenRef = useRef(null);
    return (only) => {
        if (tokenRef.current) {
            tokenRef.current.abort();
        }
        tokenRef.current = new AbortController();

        return axios
            .get(route("workspaces.initWorkspaceData", workspaceId), {
                params: { only },
                signal: tokenRef.current.signal,
            })
            .then((response) => {
                dispatch(setWorkspaceData(response.data));
                dispatch(
                    setNotificationsCount(response.data.newNotificationsCount)
                );
            })
            .catch((error) => {
                console.error(error);
            });
    };
};
export default useLoadWorkspaceData;
