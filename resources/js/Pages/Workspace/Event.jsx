import { router, usePage } from "@inertiajs/react";
import React, { useCallback, useMemo, useRef } from "react";
import { useEffect } from "react";
import { setManyOnline, setOnlineStatus } from "@/Store/OnlineStatusSlice";
import { useDispatch, useSelector } from "react-redux";
import { addActivity, addNotificationCount } from "@/Store/activitySlice";
import { isChannelsNotificationBroadcast } from "@/helpers/notificationTypeHelper";

import { toggleHuddle } from "@/Store/huddleSlice";
import { deleteFileInThread, setThreadedMessageId } from "@/Store/threadSlice";

import {
    addWorkspaceUser,
    updateWorkspaceUserInformation,
} from "@/Store/workspaceUsersSlice";
import {
    addMessageCountForChannel,
    addNewChannelToChannelsStore,
    removeChannel,
    removeChannelFromChannelsStore,
    updateChannelInformation,
} from "@/Store/channelsSlice";
import { isHiddenUser } from "@/helpers/userHelper";
import {
    addManagersToChannel,
    addMessage,
    addUsersToChannel,
    deleteMessage,
    editMessage,
    removeManagerFromChannel,
    removeUserFromChannel,
    setChannelData,
} from "@/Store/channelsDataSlice";
import { useParams } from "react-router-dom";

export default function Event() {
    const { auth } = usePage().props;
    const { channelId } = useParams();
    const { workspace } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();
    const { channels } = useSelector((state) => state.channels);
    const channelsData = useSelector((state) => state.channelsData);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const { threadMessageId } = useSelector((state) => state.thread);
    const connectionRef = useRef(null);
    const { channelId: huddleChannelId } = useSelector((state) => state.huddle);
    const mainChannel = useMemo(() => {
        return channels.find((cn) => cn.is_main_channel);
    }, [channels]);

    const userListener = useCallback(() => {
        Echo.private("App.Models.User." + auth.user.id).notification(
            (notification) => {
                console.log("new", notification);
                dispatch(addNotificationCount());
                if (isChannelsNotificationBroadcast(notification.type)) {
                    const { channel, changesType } = notification;
                    switch (changesType) {
                        case "addedToNewChannel":
                            dispatch(addNewChannelToChannelsStore(channel));
                            console.log(channelId);
                            if (channelsData.hasOwnProperty(channelId)) {
                                console.log(
                                    "Added to new channel and has channel data already, need to update"
                                );
                                loadChannelRelatedData(
                                    ["permissions", "channelPermissions"],
                                    channelId,
                                    dispatch,
                                    setChannelData
                                );
                            }
                            break;
                        case "removedFromChannel":
                            if (channel.id != channelId) {
                                dispatch(removeChannel(channel.id));
                            } else {
                                if (channel.type == "PRIVATE") {
                                    dispatch(removeChannel(channel.id));
                                    if (channel.id == channelId) {
                                        router.get(
                                            route("channels.show", {
                                                workspace: workspace.id,
                                                channel: mainChannel.id,
                                            }),
                                            {},
                                            {
                                                preserveState: true,
                                            }
                                        );
                                    }
                                } else {
                                    loadChannelRelatedData(
                                        ["permissions", "channelPermissions"],
                                        channelId,
                                        dispatch,
                                        setChannelData
                                    );
                                }
                            }
                            break;
                    }
                }
            }
        );
    }, [channelId, workspace.id, mainChannel.id, auth.user.id, channelsData]);
    useEffect(() => {
        userListener();
        return () => {
            Echo.leave("App.Models.User." + auth.user.id);
        };
    }, [userListener, auth.user.id]);

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
                console.log("workspaceEvent", e);
                switch (e.type) {
                    case "ChannelObserver_storeChannel":
                        const newChannel = e.data;
                        if (
                            newChannel.type == "DIRECT" &&
                            newChannel.name
                                .split("_")
                                .some((id) => id == auth.user.id)
                        ) {
                            dispatch(addNewChannelToChannelsStore(e.data));
                        } else if (newChannel.type != "DIRECT") {
                            dispatch(addNewChannelToChannelsStore(e.data));
                        }
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
                        dispatch(
                            deleteFile({ id: cn.id, data: { file_id: e.data } })
                        );
                        dispatch(deleteFileInThread(e.data));
                        break;
                    case "UserObserver_updated":
                        dispatch(
                            updateWorkspaceUserInformation({
                                id: e.data.id,
                                data: e.data,
                            })
                        );
                        break;
                    case "newUserJoinWorkspace":
                        dispatch(addWorkspaceUser(e.data));
                        dispatch(
                            addUsersToChannel({
                                id: mainChannel.id,
                                userIds: [e.data.id],
                            })
                        );
                        break;
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
            console.log("Listen for channel: " + cn.name);
            Echo.private(`private_channels.${cn.id}`)
                .listen("MessageEvent", (e) => {
                    console.log("messageEvent", e);

                    switch (e.type) {
                        case "newMessageCreated":
                            if (
                                !isHiddenUser(
                                    workspaceUsers,
                                    e.message?.user_id
                                )
                            ) {
                                dispatch(
                                    addMessage({ id: cn.id, data: e.message })
                                );
                                // setNewMessageReceived(true);
                            }
                            if (e.message?.user_id != auth.user.id)
                                if (cn.id != channelId)
                                    if (
                                        !isHiddenUser(
                                            workspaceUsers,
                                            e.message?.user_id
                                        )
                                    )
                                        dispatch(addMessageCountForChannel(cn));
                            break;
                        case "messageEdited":
                            dispatch(
                                editMessage({
                                    id: cn.id,
                                    data: {
                                        message_id: e.message.id,
                                        content: e.message.content,
                                    },
                                })
                            );
                            break;
                        case "messageDeleted":
                            if (threadMessageId == e.message?.id)
                                dispatch(setThreadedMessageId(null));
                            dispatch(
                                deleteMessage({
                                    id: cn.id,
                                    data: {
                                        message_id: e.message?.id,
                                    },
                                })
                            );

                        default:
                            break;
                    }
                })
                .listen("ChannelEvent", (e) => {
                    console.log("channelEvent", e);
                    switch (e.type) {
                        case "addManagers":
                            dispatch(
                                addManagersToChannel({
                                    id: cn.id,
                                    userIds: e.data,
                                })
                            );
                            if (e.data?.find((id) => id == auth.user.id)) {
                                loadChannelRelatedData(
                                    ["permissions", "channelPermissions"],
                                    channelId,
                                    dispatch,
                                    setChannelData
                                );
                            }
                            break;
                        case "removeManager":
                            dispatch(
                                removeManagerFromChannel({
                                    id: cn.id,
                                    userId: e.data,
                                })
                            );
                            if (e.data == auth.user.id) {
                                loadChannelRelatedData(
                                    ["permissions", "channelPermissions"],
                                    channelId,
                                    dispatch,
                                    setChannelData
                                );
                            }
                            break;

                        case "changeType":
                            loadChannelRelatedData(
                                ["permissions", "channelPermissions"],
                                channelId,
                                dispatch,
                                setChannelData
                            );
                            break;
                        case "leave":
                            dispatch(
                                removeManagerFromChannel({
                                    id: cn.id,
                                    userId: e.data,
                                })
                            );
                            dispatch(
                                removeUserFromChannel({
                                    id: cn.id,
                                    userId: e.data,
                                })
                            );

                            break;
                        case "removeUserFromChannel":
                            dispatch(
                                removeManagerFromChannel({
                                    id: cn.id,
                                    userId: e.data,
                                })
                            );
                            dispatch(
                                removeUserFromChannel({
                                    id: cn.id,
                                    userId: e.data,
                                })
                            );

                            break;
                        case "addUsersToChannel":
                            dispatch(
                                addUsersToChannel({
                                    id: cn.id,
                                    userIds: e.data,
                                })
                            );

                            break;
                        case "updateChannelPermissions":
                            loadChannelRelatedData(
                                ["permissions", "channelPermissions"],
                                channelId,
                                dispatch,
                                setChannelData
                            );
                            break;

                        case "archiveChannel":
                            loadChannelRelatedData(
                                ["permissions", "channelPermissions"],
                                channelId,
                                dispatch,
                                setChannelData
                            );
                            break;
                        case "join":
                            dispatch(
                                addUsersToChannel({
                                    id: cn.id,
                                    userIds: [e.data],
                                })
                            );
                            break;
                    }
                });
        });
    }
    useEffect(() => {
        listenChannels();
        // return () => {
        //     channels.forEach((cn) => {
        //         Echo.leave(`private_channels.${cn.id}`);
        //     });
        // };
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
