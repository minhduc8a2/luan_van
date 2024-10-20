import { router, usePage } from "@inertiajs/react";
import React, { useCallback, useRef } from "react";
import { useEffect } from "react";
import { setManyOnline, setOnlineStatus } from "@/Store/OnlineStatusSlice";
import { useDispatch, useSelector } from "react-redux";
import { addNotificationCount } from "@/Store/activitySlice";
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
    updateChannelInformation,
} from "@/Store/channelsSlice";
import { isHiddenUser } from "@/helpers/userHelper";
import {
    addManagersToChannel,
    addMessage,
    addUsersToChannel,
    clearChannelData,
    deleteMessage,
    editMessage,
    removeManagerFromChannel,
    removeUserFromChannel,
} from "@/Store/channelsDataSlice";
import { useNavigate, useParams } from "react-router-dom";
import useReloadPermissions from "@/helpers/useReloadPermissions";
import useGoToChannel from "@/helpers/useGoToChannel";
import useLoadWorkspaceData from "@/helpers/useLoadWorkspaceData";
import { updateCurrentWorkspace } from "@/Store/workspaceSlice";
import useReloadLoadedChannelsDataPermissions from "@/helpers/useReloadLoadedChannelsDataPermissions";
import useLoadWorkspaces from "@/helpers/useLoadWorkspaces";

export default function Event() {
    const { auth } = usePage().props;
    const { channelId, workspaceId } = useParams();
    const { workspace } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();
    const { channels } = useSelector((state) => state.channels);
    const channelsData = useSelector((state) => state.channelsData);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const { threadMessageId } = useSelector((state) => state.thread);
    const connectionRef = useRef(null);
    const { channelId: huddleChannelId } = useSelector((state) => state.huddle);
    const reloadPermissions = useReloadPermissions(workspaceId);
    const reloadLoadedChannelsDataPermissions =
        useReloadLoadedChannelsDataPermissions(workspaceId);
    const goToChannel = useGoToChannel();
    const loadWorkspaceData = useLoadWorkspaceData();
    const channelsDataRef = useRef(null);
    const channelsRef = useRef(null);
    const workspaceUsersRef = useRef(null);
    const threadMessageIdRef = useRef(null);
    const channelIdRef = useRef(null);
    const huddleChannelIdRef = useRef(null);
    const mainChannelRef = useRef(null);
    const reloadLoadedChannelsDataPermissionsRef = useRef(null);
    const navigate = useNavigate();
    const loadWorkspaces = useLoadWorkspaces();
    useEffect(() => {
        reloadLoadedChannelsDataPermissionsRef.current =
            reloadLoadedChannelsDataPermissions;
    }, [reloadLoadedChannelsDataPermissions]);
    useEffect(() => {
        channelsDataRef.current = channelsData;
    }, [channelsData]);

    useEffect(() => {
        channelsRef.current = channels;
    }, [channels]);
    useEffect(() => {
        workspaceUsersRef.current = workspaceUsers;
    }, [workspaceUsers]);

    useEffect(() => {
        threadMessageIdRef.current = threadMessageId;
    }, [threadMessageId]);

    useEffect(() => {
        channelIdRef.current = channelId;
    }, [channelId]);

    useEffect(() => {
        huddleChannelIdRef.current = huddleChannelId;
    }, [huddleChannelId]);

    useEffect(() => {
        mainChannelRef.current = { id: workspace.main_channel_id };
    }, [workspace]);

    const userListener = useCallback(() => {
        Echo.private("App.Models.User." + auth.user.id).notification(
            (notification) => {
                console.log(notification);
                const { workspace: notificationWorkspace } = notification;

                if (workspaceId != notificationWorkspace.id) return;
                dispatch(addNotificationCount());
                if (isChannelsNotificationBroadcast(notification.type)) {
                    const { channel, changesType } = notification;
                    switch (changesType) {
                        case "addedToNewChannel":
                            dispatch(addNewChannelToChannelsStore(channel));

                            if (
                                channelsDataRef.current.hasOwnProperty(
                                    channelIdRef.current
                                )
                            ) {
                                console.log(
                                    "Added to new channel and has channel data already, need to update"
                                );
                                reloadPermissions(channelIdRef.current);
                            }
                            break;
                        case "removedFromChannel":
                            if (channel.id != channelIdRef.current) {
                                dispatch(removeChannel(channel.id));
                            } else {
                                if (channel.type == "PRIVATE") {
                                    dispatch(removeChannel(channel.id));
                                    if (channel.id == channelIdRef.current) {
                                        router.get(
                                            route("channels.show", {
                                                workspace: workspaceId,
                                                channel:
                                                    mainChannelRef.current.id,
                                            }),
                                            {},
                                            {
                                                preserveState: true,
                                            }
                                        );
                                    }
                                } else {
                                    reloadPermissions(channelIdRef.current);
                                }
                            }
                            break;
                    }
                }
            }
        );
    }, [workspaceId, auth.user.id]);
    useEffect(() => {
        userListener();
        console.log("user listener registered");
        return () => {
            Echo.leave("App.Models.User." + auth.user.id);
            console.log("leave user listener");
        };
    }, [userListener, auth.user.id]);

    function workspaceListener() {
        console.log("init worksapce listener");
        connectionRef.current = Echo.join(`workspaces.${workspaceId}`);
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
                                    workspaceUsersRef.current,
                                    e.message?.user_id
                                )
                            ) {
                                dispatch(
                                    addMessage({ id: cn.id, data: e.message })
                                );
                                // setNewMessageReceived(true);
                            }
                            if (e.message?.user_id != auth.user.id)
                                if (cn.id != channelIdRef.current)
                                    if (
                                        !isHiddenUser(
                                            workspaceUsersRef.current,
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
                            if (threadMessageIdRef.current == e.message?.id)
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
                                reloadPermissions(cn.id);
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
                                reloadPermissions(cn.id);
                            }
                            break;

                        case "changeType":
                            reloadPermissions(cn.id);
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
                            reloadPermissions(cn.id);
                            break;

                        case "archiveChannel":
                            reloadPermissions(cn.id);

                            break;
                        case "unarchiveChannel":
                            reloadPermissions(cn.id);

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
        //If leave channel, will not receive events
        // return () => {
        //     channels.forEach((cn) => {
        //         Echo.leave(`private_channels.${cn.id}`);
        //     });
        // };
    }, [channels, workspaceId, auth.user.id]);
    useEffect(() => {
        workspaceListener();

        return () => {
            connectionRef.current = null;
            Echo.leave(`workspaces.${workspaceId}`);
        };
    }, [workspaceId]);

    useEffect(() => {
        Echo.private(`private_workspaces.${workspaceId}`).listen(
            "WorkspaceEvent",
            (e) => {
                console.log("workspaceEvent", e);
                switch (e.type) {
                    case "WorkspaceObserver_updated":
                        dispatch(updateCurrentWorkspace(e.data));
                        break;
                    case "InvitationPermission_updated":
                        loadWorkspaceData("workspacePermissions");
                        break;
                    case "DeactivateUser_updated":
                        dispatch(
                            updateWorkspaceUserInformation({
                                id: e.data?.id,
                                data: e.data,
                            })
                        );
                        if (
                            e.data?.id == auth.user.id &&
                            !!e.data?.pivot?.is_deactivated
                        ) {
                            loadWorkspaces().then(() =>
                                navigate("/workspaces")
                            );
                        }
                        break;
                    case "AcceptJoiningRequest":
                        e.data?.forEach((user) =>
                            dispatch(
                                updateWorkspaceUserInformation({
                                    id: user.id,
                                    data: user,
                                })
                            )
                        );

                        break;
                    case "UserRole_updated":
                        dispatch(
                            updateWorkspaceUserInformation({
                                id: e.data?.id,
                                data: e.data,
                            })
                        );
                        if (auth.user.id == e.data?.id) {
                            reloadLoadedChannelsDataPermissionsRef.current();
                            loadWorkspaceData("workspacePermissions");
                        }
                        break;
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
                            if (newChannel.user_id == auth.user.id) {
                                dispatch(addNewChannelToChannelsStore(e.data));
                            }
                        }
                        break;
                    case "ChannelObserver_deleteChannel":
                        if (huddleChannelIdRef.current == e.data) {
                            dispatch(toggleHuddle());
                        }

                        if (channelIdRef.current == e.data) {
                            goToChannel(workspaceId, mainChannelRef.current.id);
                        }
                        dispatch(removeChannel(e.data));
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
                                id: mainChannelRef.current.id,
                                userIds: [e.data.id],
                            })
                        );
                        break;
                    default:
                        break;
                }
            }
        );
        return () => {
            Echo.leave(`private_workspaces.${workspaceId}`);
        };
    }, [workspaceId, auth.user.id]);

    useEffect(() => {
        if (connectionRef.current)
            connectionRef.current
                .joining((user) => {
                    dispatch(setOnlineStatus({ user, onlineStatus: true }));
                })
                .leaving((user) => {
                    dispatch(setOnlineStatus({ user, onlineStatus: false }));
                });
    }, [workspaceId]);

    return <></>;
}
