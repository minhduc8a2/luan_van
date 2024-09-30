import { router, usePage } from "@inertiajs/react";
import React, { useRef } from "react";
import { useEffect } from "react";
import { setManyOnline, setOnlineStatus } from "@/Store/OnlineStatusSlice";
import { useDispatch, useSelector } from "react-redux";
import { addActivity } from "@/Store/activitySlice";
import { isChannelsNotificationBroadcast } from "@/helpers/notificationTypeHelper";

import { toggleHuddle } from "@/Store/huddleSlice";
import { deleteFileInThread} from "@/Store/threadSlice";
import { deleteFile } from "@/Store/messagesSlice";
import { updateWorkspaceUserInformation } from "@/Store/workspaceUsersSlice";
import {
    addMessageCountForChannel,
    addNewChannelToChannelsStore,
    removeChannelFromChannelsStore,
    updateChannelInformation,
} from "@/Store/channelsSlice";
import { isHiddenUser } from "@/helpers/userHelper";

export default function Event() {
    const { workspace, channelId, auth } = usePage().props;
    const dispatch = useDispatch();
    const { channels } = useSelector((state) => state.channels);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const connectionRef = useRef(null);
    const { channelId: huddleChannelId } = useSelector((state) => state.huddle);
    useEffect(() => {
        Echo.private("App.Models.User." + auth.user.id).notification(
            (notification) => {
                console.log("new", notification);
                dispatch(addActivity(notification));
                if (isChannelsNotificationBroadcast(notification.type)) {
                    switch (notification.changesType) {
                        case "addedToNewChannel":
                        case "removedFromChannel":
                            router.reload({
                                preserveState: true,
                                only: [
                                    "channel",
                                    "messages",
                                    "channelUsers",
                                    "channels",

                                    "permissions",
                                ],
                            });
                            break;

                        default:
                            break;
                    }
                }
            }
        );
        return () => {
            Echo.leave("App.Models.User." + auth.user.id);
        };
    }, [workspace.id]);
    function workspaceListener() {
        console.log("init worksapce listener");
        connectionRef.current = Echo.join(`workspaces.${workspace.id}`);
        connectionRef.current
            .here((users) => {
                dispatch(setManyOnline(users));
            })
            .joining((user) => {
                dispatch(setOnlineStatus({ user, onlineStatus: true }));
            })
            .leaving((user) => {
                dispatch(setOnlineStatus({ user, onlineStatus: false }));
            })
            .listen("WorkspaceEvent", (e) => {
                console.log(e);
                switch (e.type) {
                    case "ChannelObserver_storeChannel":
                        dispatch(addNewChannelToChannelsStore(e.data));
                        break;
                    case "ChannelObserver_deleteChannel":
                        if (huddleChannelId == e?.data) {
                            dispatch(toggleHuddle());
                        }
                        dispatch(removeChannelFromChannelsStore(e.data));
                        break;
                    case "ChannelObserver_updated":
                        dispatch(
                            updateChannelInformation({
                                id: e.data?.id,
                                data: e.data,
                            })
                        );
                        break;
                    case "FileObserver_fileDeleted":
                        dispatch(deleteFile(e.data));
                        dispatch(deleteFileInThread(e.data));
                        break;
                    case "UserObserver_updated":
                        dispatch(
                            updateWorkspaceUserInformation({
                                id: e.data.id,
                                data: e.data,
                            })
                        );
                    default:
                        break;
                }
            })
            .error((error) => {
                console.error(error);
            });
    }
    function listenChannels() {
        channels.forEach((cn) => {
            Echo.private(`private_channels.${cn.id}`).listen(
                "MessageEvent",
                (e) => {
                    console.log(e);
                    if (e.message?.user_id != auth.user.id)
                        if (cn.id != channelId)
                            if (
                                e.type == "newMessageCreated" &&
                                !isHiddenUser(
                                    workspaceUsers,
                                    e.message?.user_id
                                )
                            )
                                dispatch(addMessageCountForChannel(cn));
                }
            );
        });
    }
    useEffect(() => {
        listenChannels();
        return () => {
            channels.forEach((cn) => {
                Echo.leave(`private_channels.${cn.id}`);
            });
        };
    }, [channels]);
    useEffect(() => {
        workspaceListener();

        return () => {
            connectionRef.current = null;
            Echo.leave(`workspaces.${workspace.id}`);
        };
    }, [workspace.id]);
    useEffect(() => {
        if (connectionRef.current)
            connectionRef.current
                .joining((user) => {
                    dispatch(setOnlineStatus({ user, onlineStatus: true }));
                })
                .leaving((user) => {
                    dispatch(setOnlineStatus({ user, onlineStatus: false }));
                });
    }, [workspace.id]);

    return <></>;
}
