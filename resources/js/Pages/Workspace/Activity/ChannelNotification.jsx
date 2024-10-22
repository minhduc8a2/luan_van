import { usePage } from "@inertiajs/react";
import React, { useMemo } from "react";

import Avatar from "@/Components/Avatar";
import { UTCToDateTime } from "@/helpers/dateTimeHelper";

import { useDispatch, useSelector } from "react-redux";
import { isChannelsNotificationBroadcast } from "@/helpers/notificationTypeHelper";
import { getChannelName } from "@/helpers/channelHelper";

import { FaLock } from "react-icons/fa";

import { useParams } from "react-router-dom";
import useGoToChannel from "@/helpers/useGoToChannel";
import { setNotificationPopup } from "@/Store/notificationPopupSlice";
import ChannelEventsEnum from "@/services/Enums/ChannelEventsEnum";
export default function ChannelNotification({
    notification,
    handleNotificationClick,
}) {
    const { auth } = usePage().props;
    const { workspaceId } = useParams();
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    // console.log(notification);

    const { channel, workspace, data, changesType } =
        isChannelsNotificationBroadcast(notification.type)
            ? notification
            : notification.data;
    const byUser = data?.byUser;
    const read_at = notification.read_at;
    const created_at = notification.created_at;
    const view_at = notification.view_at;

    const dispatch = useDispatch();
    const goToChannel = useGoToChannel();
    function handleNotificationClickedPart() {
        axios
            .get(route("channels.checkExists", workspaceId), {
                params: { channelId: channel.id },
            })
            .then((response) => {
                let result = response?.data?.result;
                if (!result) {
                    dispatch(
                        setNotificationPopup({
                            type: "error",
                            messages: ["Channel not found!"],
                        })
                    );
                    return;
                }
                if (changesType != "deleteChannel") {
                    goToChannel(workspace.id, channel.id);
                }
            });
    }
    const channelName = useMemo(
        () => getChannelName(channel, workspaceUsers, auth.user),
        [channel]
    );

    let message = useMemo(() => {
        switch (changesType) {
            case ChannelEventsEnum.ADDED_TO_NEW_CHANNEL:
                return (
                    <div className="text-left">
                        {`${byUser.name} has added you to `}
                        <div className="inline-block">
                            <div className="flex items-baseline ">
                                {channel.type == "PUBLIC" ? (
                                    <span className="">#</span>
                                ) : (
                                    <FaLock className="text-sm inline" />
                                )}{" "}
                                {channelName}
                            </div>
                        </div>
                    </div>
                );
            case ChannelEventsEnum.REMOVED_FROM_CHANNEL:
                return (
                    <div className="text-left">
                        {`${byUser.name} has remove you from `}
                        <div className="inline-block">
                            <div className="flex items-baseline ">
                                {channel.type == "PUBLIC" ? (
                                    <span className="">#</span>
                                ) : (
                                    <FaLock className="text-sm inline" />
                                )}{" "}
                                {channelName}
                            </div>
                        </div>
                    </div>
                );
            case ChannelEventsEnum.DELETE_CHANNEL:
                return (
                    <div className="text-left">
                        {`${byUser.name} has deleted `}
                        <div className="inline-block">
                            <div className="flex items-baseline ">
                                {channel.type == "PUBLIC" ? (
                                    <span className="">#</span>
                                ) : (
                                    <FaLock className="text-sm inline" />
                                )}{" "}
                                {channelName}
                            </div>
                        </div>
                    </div>
                );
            case ChannelEventsEnum.REMOVED_MANAGER_ROLE:
                return (
                    <div className="text-left">
                        {`${byUser.name} has removed your Manager Role in `}
                        <div className="inline-block">
                            <div className="flex items-baseline ">
                                {channel.type == "PUBLIC" ? (
                                    <span className="">#</span>
                                ) : (
                                    <FaLock className="text-sm inline" />
                                )}{" "}
                                {channelName}
                            </div>
                        </div>
                    </div>
                );
            case ChannelEventsEnum.ADDED_AS_MANAGER:
                return (
                    <div className="text-left">
                        {`${byUser.name} has added you as Manager in channel `}
                        <div className="inline-block">
                            <div className="flex items-baseline ">
                                {channel.type == "PUBLIC" ? (
                                    <span className="">#</span>
                                ) : (
                                    <FaLock className="text-sm inline" />
                                )}{" "}
                                {channelName}
                            </div>
                        </div>
                    </div>
                );
            case ChannelEventsEnum.CHANGE_CHANNEL_TYPE:
                return (
                    <div className="text-left">
                        {`${byUser.name} has changed channel privacy from ${data.oldType} to ${data.newType}`}
                    </div>
                );
            case ChannelEventsEnum.UNARCHIVE_CHANNEL:
                return (
                    <div className="text-left">
                        {`${byUser.name} has unarchived channel `}
                        <div className="inline-block">
                            <div className="flex items-baseline ">
                                {channel.type == "PUBLIC" ? (
                                    <span className="">#</span>
                                ) : (
                                    <FaLock className="text-sm inline" />
                                )}{" "}
                                {channelName}
                            </div>
                        </div>
                    </div>
                );
            case ChannelEventsEnum.ARCHIVE_CHANNEL:
                return (
                    <div className="text-left">
                        {`${byUser.name} has archived channel `}
                        <div className="inline-block">
                            <div className="flex items-baseline ">
                                {channel.type == "PUBLIC" ? (
                                    <span className="">#</span>
                                ) : (
                                    <FaLock className="text-sm inline" />
                                )}{" "}
                                {channelName}
                            </div>
                        </div>
                    </div>
                );
            default:
                break;
        }
    }, [notification]);
    if (byUser.id == auth.user.id) return "";
    return (
        <div>
            <button
                className={`p-4 pl-8 w-full hover:bg-color/15 border-t border-color/15 ${
                    read_at != null ? "" : "bg-primary-300/15"
                }`}
                onClick={() => {
                    console.log(notification);
                    handleNotificationClick(
                        notification,
                        handleNotificationClickedPart
                    );
                }}
            >
                <div className="flex  items-center mb-4">
                    <div className="text-sm flex items-baseline gap-x-1 font-semibold text-white/75">
                        Changes in
                        <div className="flex items-baseline ">
                            {channel.type == "PUBLIC" ? (
                                <span className="">#</span>
                            ) : (
                                <FaLock className="text-sm inline" />
                            )}{" "}
                            {channelName}
                        </div>
                        (<span className="">{workspace.name}</span>)
                    </div>
                </div>
                <div className="flex gap-x-2 justify-between">
                    <div className={`message-container   flex-1`}>
                        <Avatar
                            src={byUser.avatar_url}
                            className="w-8 h-8"
                            noStatus={true}
                        />
                        <div className="mx-2 ">
                            <div className="flex gap-x-2 items-center">
                                <div className="text-sm font-bold">
                                    {byUser.name}
                                </div>
                                <div className="text-xs">
                                    {UTCToDateTime(created_at)}
                                </div>
                            </div>
                            {message}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div
                            className={`${
                                view_at == null ? "bg-blue-500" : ""
                            } rounded-full w-3 h-3`}
                        ></div>
                    </div>
                </div>
            </button>
        </div>
    );
}
