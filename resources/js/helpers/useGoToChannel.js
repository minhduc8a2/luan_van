import { useNavigate } from "react-router-dom";

const useGoToChannel = () => {
    const navigate = useNavigate();
    return (workspaceId, channelId) => {
        navigate(`/workspaces/${workspaceId}/channels/${channelId}`);
    };
};

export default useGoToChannel;
