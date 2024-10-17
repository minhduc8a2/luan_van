import { setWorkspaceData } from "@/Store/workspaceSlice";
import { useRef } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

const useLoadWorkspaceData = () => {
    const dispatch = useDispatch();
    const { workspaceId } = useParams();
    const tokenRef = useRef(null);
    return () => {
        if (tokenRef.current) {
            tokenRef.current.abort();
        }
        tokenRef.current = new AbortController();

        return axios
            .get(route("workspaces.initWorkspaceData", workspaceId), {
                signal: tokenRef.current.signal,
            })
            .then((response) => {
                dispatch(setWorkspaceData(response.data));
            })
            .catch((error) => {
                console.error(error);
            });
    };
};
export default useLoadWorkspaceData;
