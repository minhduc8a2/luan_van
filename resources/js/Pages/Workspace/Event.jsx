import { router, usePage } from "@inertiajs/react";
import React, { useRef } from "react";
import { useEffect } from "react";
import { setManyOnline, setOnlineStatus } from "@/Store/OnlineStatusSlice";
import { useDispatch } from "react-redux";
import { addActivity } from "@/Store/activitySlice";
import { isChannelsNotificationBroadcast } from "@/helpers/notificationTypeHelper";
import { addMessageCountForChannel } from "@/Store/newMessageCountsMapSlice";
export default function Event() {
    const { workspace, channel, auth, channels } = usePage().props;
    const dispatch = useDispatch();
    const connectionRef = useRef(null);
    useEffect(() => {
        Echo.private("App.Models.User." + auth.user.id).notification(
            (notification) => {
                dispatch(addActivity(notification));
                if (isChannelsNotificationBroadcast(notification.type)) {
                    switch (notification.changesType) {
                        case "addedToNewChannel":
                        case "removedFromChannel":
                            router.reload({
                                only: [
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
                }
            })
            .error((error) => {
                console.error(error);
            });
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
                    router.get(
                        route("channel.show", channel.id),
                        {},
                        {
                            preserveState: true,
                            only: ["channelUsers", "directChannels", "users"],
                        }
                    );
                })
                .leaving((user) => {
                    dispatch(setOnlineStatus({ user, onlineStatus: false }));
                    route("channel.show", channel.id),
                        {},
                        {
                            preserveState: true,
                            only: ["channelUsers", "directChannels", "users"],
                        };
                });
    }, [workspace.id, channel.id]);

    useEffect(() => {
        channels.forEach((cn) => {
            Echo.private(`private_channels.${cn.id}`).listen(
                "MessageEvent",
                (e) => {
                    if (e.message?.user_id != auth.user.id)
                        if (cn.id != channel.id)
                            dispatch(addMessageCountForChannel(cn));
                }
            );
        });
        return () => {
            channels.forEach((cn) => {
                Echo.leave(`private_channels.${cn.id}`);
            });
        };
    }, [channels, channel]);

    return <></>;
}
