import { setWorkspaces } from "@/Store/workspaceSlice";
import { useDispatch } from "react-redux";

const useLoadWorkspaces = () => {
    const dispatch = useDispatch();

    return () => {
        return axios.get(route("workspaces")).then((response) => {
            dispatch(setWorkspaces({ workspaces: response.data.workspaces }));
        });
    };
};
export default useLoadWorkspaces;
