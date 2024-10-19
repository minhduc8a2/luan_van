import { useDispatch } from "react-redux";
import useErrorHandler from "./useErrorHandler";
import useReloadPermissions from "./useReloadPermissions";
import { addJoinedChannelId } from "@/Store/joinedChannelIdsSlice";
import { useParams } from "react-router-dom";

const useJoinChannel = () => {
    const { workspaceId } = useParams();
    const reloadPermissions = useReloadPermissions(workspaceId);
    const errorHandler = useErrorHandler();
    const dispatch = useDispatch();

    return (channelId) => {
        return axios
            .post(
                route("channels.join", {
                    workspace: workspaceId,
                    channel: channelId,
                }),
                {},
                {
                    headers: {
                        "X-Socket-Id": Echo.socketId(),
                    },
                }
            )
            .then((response) => {
                reloadPermissions(channelId);
                dispatch(addJoinedChannelId({ id: channelId }));
                return response;
            })
            .catch(errorHandler);
    };
};
export default useJoinChannel;
