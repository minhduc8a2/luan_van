import { setLeftWindowType } from "@/Store/windowTypeSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const useGoToChannel = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    return (workspaceId, channelId) => {
        dispatch(setLeftWindowType("panel"));
        navigate(`/workspaces/${workspaceId}/channels/${channelId}`);
    };
};

export default useGoToChannel;
