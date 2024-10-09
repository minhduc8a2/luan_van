import { removeChannel } from "@/Store/channelsSlice";
import { useMainChannel } from "./customHooks";
import useErrorHandler from "./useErrorHandler";
import useReloadPermissions from "./useReloadPermissions";
import useSuccessHandler from "./useSuccessHandler";
import { useDispatch } from "react-redux";
import useGoToChannel from "./useGoToChannel";
import { removeJoinedChannelId } from "@/Store/joinedChannelIdsSlice";

const useLeaveChannel = (workspaceId) => {
    const successHandler = useSuccessHandler("Leave channel successfully!");
    const errorHandler = useErrorHandler();
    const { mainChannel } = useMainChannel(workspaceId);
    console.log("mainChannel", mainChannel);
    const reloadPermissions = useReloadPermissions();
    const dispatch = useDispatch();
    const goToChannel = useGoToChannel();
    return (channelId, channelType, wantToGoToMainChannel = true) => {
        return axios
            .post(
                route("channel.leave", {
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
                successHandler(response);
                dispatch(removeJoinedChannelId({ id: channelId }));

                if (channelType == "PRIVATE") {
                    if (wantToGoToMainChannel) {
                        goToChannel(mainChannel.workspace_id, mainChannel.id);
                    }
                    dispatch(removeChannel(channelId));
                } else {
                    reloadPermissions(channelId);
                }
                return response;
            })
            .catch(errorHandler);
    };
};

export default useLeaveChannel;
