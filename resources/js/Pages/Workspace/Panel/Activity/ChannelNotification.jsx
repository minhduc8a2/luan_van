import { router, usePage } from "@inertiajs/react";
import React, { useMemo } from "react";
import { FiHeadphones } from "react-icons/fi";
import Avatar from "@/Components/Avatar";
import { UTCToDateTime } from "@/helpers/dateTimeHelper";
import { VscMention } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { isChannelsNotificationBroadcast } from "@/helpers/notificationTypeHelper";
import { getChannelName } from "@/helpers/channelHelper";
import { setMessageId } from "@/Store/mentionSlice";
import { FaLock } from "react-icons/fa";

export default function ChannelNotification({
    notification,
    handleNotificationClick,
}) {
    const {
        auth,
        users: workspaceUsers,

        channel: currentChannel,
    } = usePage().props;
    console.log(notification);
    const { messages } = useSelector((state) => state.messages);
    const { fromUser, channel, workspace, data, changesType } =
        isChannelsNotificationBroadcast(notification.type)
            ? notification
            : notification.data;
    const read_at = notification.read_at;
    const created_at = notification.created_at;
    const view_at = notification.view_at;
    const dispatch = useDispatch();
    function handleNotificationClickedPart() {
        if (changesType != "deleteChannel") {
            router.visit(route("channel.show", channel.id), {
                preserveState: true,
            });
        }
    }
    const channelName = useMemo(
        () => getChannelName(channel, workspaceUsers, auth.user),
        [channel]
    );

    let message = useMemo(() => {
        switch (changesType) {
            case "addedToNewChannel":
                return (
                    <div className="text-left">
                        {`${fromUser.name} has added you to `}
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
            case "removedFromChannel":
                return (
                    <div className="text-left">
                        {`${fromUser.name} has remove you from `}
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
            case "deleteChannel":
                return (
                    <div className="text-left">
                        {`${fromUser.name} has deleted `}
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
            case "removedManagerRole":
                return (
                    <div className="text-left">
                        {`${fromUser.name} has removed your Manager Role in `}
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
            case "addedAsManager":
                return (
                    <div className="text-left">
                        {`${fromUser.name} has added you as Manager in channel `}
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
    return (
        <li>
            <button
                className={`p-4 pl-8 w-full hover:bg-white/15 border-t border-white/15 ${
                    read_at != null ? "" : "bg-primary-lighter/15"
                }`}
                onClick={() => {
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
                            src={fromUser.avatar_url}
                            className="w-8 h-8"
                            noStatus={true}
                        />
                        <div className="mx-2 ">
                            <div className="flex gap-x-2 items-center">
                                <div className="text-sm font-bold">
                                    {fromUser.name}
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
        </li>
    );
}