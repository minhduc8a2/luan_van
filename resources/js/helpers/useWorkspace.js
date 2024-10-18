import { useSelector } from "react-redux";

const useWorkspace = (workspaceId) => {
    const { workspaces } = useSelector((state) => state.workspace);
    return { workspace: workspaces.find((wsp) => wsp.id == workspaceId) };
};
export default useWorkspace;
