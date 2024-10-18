import { setWorkspaceUsers } from "@/Store/workspaceUsersSlice";
import { useRef } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

const useLoadWorkspaceUsers = () => {
    const dispatch = useDispatch();
    const { workspaceId } = useParams();
    const tokenRef = useRef(null);
    return (mode = "all") => {
        if (tokenRef.current) {
            tokenRef.current.abort();
        }
        tokenRef.current = new AbortController();
        return axios
            .get(route("users.browseUsers", workspaceId), {
                params: {
                    mode,
                },
                signal: tokenRef.current.signal,
            })
            .then((response) => {
                dispatch(setWorkspaceUsers(response.data));
            })
            .catch((error) => {
                console.error(error);
            });
    };
};
export default useLoadWorkspaceUsers;
