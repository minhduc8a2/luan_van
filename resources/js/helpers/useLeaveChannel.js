import { removeChannel } from "@/Store/channelsSlice";

import useErrorHandler from "./useErrorHandler";
import useReloadPermissions from "./useReloadPermissions";
import useSuccessHandler from "./useSuccessHandler";
import { useDispatch, useSelector } from "react-redux";
import useGoToChannel from "./useGoToChannel";
import { removeJoinedChannelId } from "@/Store/joinedChannelIdsSlice";

const useLeaveChannel = (workspaceId) => {
    const successHandler = useSuccessHandler("Leave channel successfully!");
    const errorHandler = useErrorHandler();
    const { workspace } = useSelector((state) => state.workspace);
    const reloadPermissions = useReloadPermissions(workspaceId);
    const dispatch = useDispatch();
    const goToChannel = useGoToChannel();
    return (channelId, channelType, wantToGoToMainChannel = true) => {
        return axios
            .post(
                route("channel.leave", {
                    workspace:workspaceId,
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
                        goToChannel(workspaceId, workspace.main_channel_id);
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
