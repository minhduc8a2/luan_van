import { router, usePage } from "@inertiajs/react";
import React, { useRef } from "react";
import { useEffect } from "react";
import { setManyOnline, setOnlineStatus } from "@/Store/OnlineStatusSlice";
import { useDispatch, useSelector } from "react-redux";
import { addActivity } from "@/Store/activitySlice";
import { isChannelsNotificationBroadcast } from "@/helpers/notificationTypeHelper";
import { addMessageCountForChannel } from "@/Store/newMessageCountsMapSlice";
import { toggleHuddle } from "@/Store/huddleSlice";
import { setThreadMessage } from "@/Store/threadSlice";
export default function Event() {
    const {
        workspace,
        channel,
        auth,
        channels,
        directChannels,
        mainChannelId,
    } = usePage().props;
    const dispatch = useDispatch();
    const connectionRef = useRef(null);
    const { channel: huddleChannel } = useSelector((state) => state.huddle);
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
                                    "availableChannels",
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
    useEffect(() => {
        connectionRef.current = Echo.join(`workspaces.${workspace.id}`);
        connectionRef.current
            .here((users) => {
                dispatch(setManyOnline(users));
            })
            .listen("WorkspaceEvent", (e) => {
                if (e.type === "storeChannel") {
                    router.reload({
                        only: ["availableChannels"],
                        preserveState: true,
                    });
                } else if (e.type == "deleteChannel") {
                    console.log("deletechannel", e);
                   
                    if (huddleChannel && huddleChannel?.id == e?.data) {
                        dispatch(toggleHuddle());
                       
                    }
                    if (channel?.id == e?.data) {
                        dispatch(setThreadMessage(null));
                        router.visit(route("channel.show", mainChannelId), {
                            preserveState: true,
                        });
                    } else {
                        router.reload({
                            only: ["availableChannels", "channels"],
                            preserveState: true,
                        });
                    }
                } else if (e.type == "newUserJoinWorkspace") {
                    if (channel.id == mainChannelId) {
                        router.reload({
                            only: ["directChannels", "users", "channelUsers"],
                            preserveState: true,
                        });
                    } else
                        router.reload({
                            only: ["directChannels", "users"],
                            preserveState: true,
                        });
                }
            })
            .error((error) => {
                console.error(error);
            });
        return () => {
            connectionRef.current = null;
            Echo.leave(`workspaces.${workspace.id}`);
        };
    }, [workspace.id, huddleChannel, channel]);
    useEffect(() => {
        if (connectionRef.current)
            connectionRef.current
                .joining((user) => {
                    dispatch(setOnlineStatus({ user, onlineStatus: true }));
                })
                .leaving((user) => {
                    dispatch(setOnlineStatus({ user, onlineStatus: false }));
                });
    }, [workspace.id, channel.id]);

    useEffect(() => {
        channels.forEach((cn) => {
            Echo.private(`private_channels.${cn.id}`).listen(
                "MessageEvent",
                (e) => {
                    if (e.message?.user_id != auth.user.id)
                        if (cn.id != channel.id)
                            if (e.type == "newMessageCreated")
                                dispatch(addMessageCountForChannel(cn));
                }
            );
        });
        directChannels.forEach((cn) => {
            Echo.private(`private_channels.${cn.id}`).listen(
                "MessageEvent",
                (e) => {
                    if (e.message?.user_id != auth.user.id)
                        if (cn.id != channel.id)
                            if (e.type == "newMessageCreated")
                                dispatch(addMessageCountForChannel(cn));
                }
            );
        });
        return () => {
            channels.forEach((cn) => {
                Echo.leave(`private_channels.${cn.id}`);
            });
            directChannels.forEach((cn) => {
                Echo.leave(`private_channels.${cn.id}`);
            });
        };
    }, [channels, channel, directChannels]);

    return <></>;
}
