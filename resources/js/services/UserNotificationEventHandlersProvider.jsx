import { usePage } from "@inertiajs/react";
import React, { useEffect, useRef } from "react";

import ChannelEventsEnum from "./Enums/ChannelEventsEnum";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addNotificationCount } from "@/Store/activitySlice";
import {
    isChannelsNotificationBroadcast,
    isWorkspaceNotificationBroadcast,
} from "@/helpers/notificationTypeHelper";
import {
    addNewChannelToChannelsStore,
    removeChannel,
    updateChannelInformation,
} from "@/Store/channelsSlice";
import useReloadPermissions from "@/helpers/useReloadPermissions";
import useGoToChannel from "@/helpers/useGoToChannel";
import { toggleHuddle } from "@/Store/huddleSlice";
import WorkspaceEventsEnum from "./Enums/WorkspaceEventsEnum";
import { addJoinedChannelId, removeJoinedChannelId } from "@/Store/joinedChannelIdsSlice";

export default function UserNotificationEventHandlersProvider({ children }) {
    const { auth } = usePage().props;
    const { channelId, workspaceId } = useParams();
    const { workspace } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();
    const goToChannel = useGoToChannel();
    //
    const reloadPermissions = useReloadPermissions(workspaceId);
    //
    const channelsData = useSelector((state) => state.channelsData);
    const channelsDataRef = useRef(null);
    //
    const channelIdRef = useRef(null);
    //
    const mainChannelIdRef = useRef(null);
    //
    const { channelId: huddleChannelId } = useSelector((state) => state.huddle);
    const huddleChannelIdRef = useRef(null);

    useEffect(() => {
        huddleChannelIdRef.current = huddleChannelId;
    }, [huddleChannelId]);
    useEffect(() => {
        channelIdRef.current = channelId;
    }, [channelId]);

    useEffect(() => {
        channelsDataRef.current = channelsData;
    }, [channelsData]);

    useEffect(() => {
        mainChannelIdRef.current = workspace?.main_channel_id;
    }, [workspace]);
    useEffect(() => {
        Echo.private("App.Models.User." + auth.user.id).notification(
            (notification) => {
                console.log(notification);

                const { workspace, channel, byUser, changesType, data } =
                    notification;
                if (workspaceId != workspace.id) return;
                if (
                    byUser?.id != auth.user.id &&
                    !isWorkspaceNotificationBroadcast(notification.type)
                ) {
                    dispatch(addNotificationCount());
                }
                if (isWorkspaceNotificationBroadcast(notification.type)) {
                    switch (changesType) {
                        case WorkspaceEventsEnum.STORE_CHANNEL:
                            dispatch(
                                addNewChannelToChannelsStore(data.channel)
                            );
                            break;

                        default:
                            break;
                    }
                }

                if (isChannelsNotificationBroadcast(notification.type)) {
                    //add count

                    //
                    switch (changesType) {
                        case ChannelEventsEnum.ADDED_TO_NEW_CHANNEL:
                            dispatch(addNewChannelToChannelsStore(channel));
                            dispatch(addJoinedChannelId({id: channel.id}))
                            if (
                                channelsDataRef.current.hasOwnProperty(
                                    channelIdRef.current
                                )
                            ) {
                                reloadPermissions(channelIdRef.current);
                            }
                            break;
                        case ChannelEventsEnum.REMOVED_FROM_CHANNEL:
                            if (channel?.id != channelIdRef.current) {
                                dispatch(removeChannel(channel?.id));
                            } else {
                                if (channel?.type == "PRIVATE") {
                                    dispatch(removeChannel(channel?.id));
                                    if (channel?.id == channelIdRef.current) {
                                        goToChannel(
                                            workspace?.id,
                                            workspace?.main_channel_id
                                        );
                                    }
                                } else {
                                    reloadPermissions(channel?.id);
                                }
                            }
                            dispatch(removeJoinedChannelId({id: channel.id}))
                            break;
                        case ChannelEventsEnum.CHANGE_CHANNEL_TYPE:
                            if (
                                channelsDataRef.current.hasOwnProperty(
                                    channel?.id
                                )
                            ) {
                                reloadPermissions(channel?.id);
                            }

                            dispatch(
                                updateChannelInformation({
                                    id: channel?.id,
                                    data: channel,
                                })
                            );
                            break;
                        case ChannelEventsEnum.DELETE_CHANNEL:
                            if (huddleChannelIdRef.current == channel?.id) {
                                dispatch(toggleHuddle());
                            }

                            if (channelIdRef.current == channel?.id) {
                                goToChannel(
                                    workspaceId,
                                    mainChannelIdRef.current
                                );
                            }
                            dispatch(removeChannel(channel?.id));
                            dispatch(removeJoinedChannelId({id: channel?.id}))
                            break;
                    }
                }
            }
        );
        console.log("Subcribed to user notifications");
        return () => {
            Echo.leave("App.Models.User." + auth.user.id);
            console.log("Unsubcribed from user notifications");
        };
    }, [workspaceId, auth.user.id]);
    return <>{children}</>;
}