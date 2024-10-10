import { useDispatch } from "react-redux";
import useErrorHandler from "./useErrorHandler";
import useReloadPermissions from "./useReloadPermissions";
import { addJoinedChannelId } from "@/Store/joinedChannelIdsSlice";

const useJoinChannel = () => {
    const reloadPermissions = useReloadPermissions();
    const errorHandler = useErrorHandler();
    const dispatch = useDispatch();

    return (channelId) => {
        return axios
            .post(
                route("channel.join", channelId),
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
