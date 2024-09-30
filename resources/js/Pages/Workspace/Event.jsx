import { router, usePage } from "@inertiajs/react";
import React, { useRef } from "react";
import { useEffect } from "react";
import { setManyOnline, setOnlineStatus } from "@/Store/OnlineStatusSlice";
import { useDispatch, useSelector } from "react-redux";
import { addActivity } from "@/Store/activitySlice";
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

export default function Event() {
    const { workspace, channelId, auth } = usePage().props;
    const dispatch = useDispatch();
    const { channels } = useSelector((state) => state.channels);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const { threadMessageId } = useSelector((state) => state.thread);
    const connectionRef = useRef(null);
    const { channelId: huddleChannelId } = useSelector((state) => state.huddle);

    const loadChannelDataTokens = useRef([]);
    function loadChannelRelatedData(types) {
        return Promise.all(
            types.map((type, index) => loadChannelData(type, index))
        );
    }

    function loadChannelData(type, index) {
        loadChannelDataTokens.current[index] = new AbortController();
        return axios
            .get(
                route("channels.initChannelData", {
                    channel: channelId,
                }),
                {
                    params: {
                        only: type,
                    },
                    signal: loadChannelDataTokens.current[index].signal,
                }
            )
            .then((response) => {
                dispatch(
                    setChannelData({ id: channelId, data: response.data })
                );
            });
    }
    useEffect(() => {
        Echo.private("App.Models.User." + auth.user.id).notification(
            (notification) => {
                console.log("new", notification);
                dispatch(addActivity(notification));
            }
        );
        return () => {
            Echo.leave("App.Models.User." + auth.user.id);
        };
    }, []);
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
                        const mainChannel = channels.find(
                            (cn) => cn.is_main_channel
                        );
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
                                loadChannelRelatedData([
                                    "permissions",
                                    "channelPermissions",
                                ]);
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
                                loadChannelRelatedData([
                                    "permissions",
                                    "channelPermissions",
                                ]);
                            }
                            break;

                        case "changeType":
                            loadChannelRelatedData([
                                "permissions",
                                "channelPermissions",
                            ]);
                            break;
                        case "leave":
                            if (e.data == auth.user.id) {
                                dispatch(removeChannel(cn.id));
                            } else {
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
                            }
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
                            if (e.data == auth.user.id) {
                                loadChannelRelatedData([
                                    "permissions",
                                    "channelPermissions",
                                ]);
                            }
                            break;
                        case "addUsersToChannel":
                            dispatch(
                                addUsersToChannel({
                                    id: cn.id,
                                    userIds: e.data,
                                })
                            );
                            if (e.data?.find((id) => id == auth.user.id)) {
                                loadChannelRelatedData([
                                    "permissions",
                                    "channelPermissions",
                                ]);
                            }
                            break;
                        case "updateChannelPermissions":
                            loadChannelRelatedData([
                                "permissions",
                                "channelPermissions",
                            ]);
                            break;

                        case "archiveChannel":
                            loadChannelRelatedData([
                                "permissions",
                                "channelPermissions",
                            ]);
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
