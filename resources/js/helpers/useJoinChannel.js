import useErrorHandler from "./useErrorHandler";
import useReloadPermissions from "./useReloadPermissions";

const useJoinChannel = () => {
    const reloadPermissions = useReloadPermissions();
    const errorHandler = useErrorHandler();
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
                return response
            })
            .catch(errorHandler);
    };
};
export default useJoinChannel;