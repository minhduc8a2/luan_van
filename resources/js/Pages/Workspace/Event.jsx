import { router, usePage } from "@inertiajs/react";
import React, { useRef } from "react";
import { useEffect } from "react";
import { setManyOnline, setOnlineStatus } from "@/Store/OnlineStatusSlice";
import { useDispatch, useSelector } from "react-redux";
import { addActivity } from "@/Store/activitySlice";
import { isChannelsNotificationBroadcast } from "@/helpers/notificationTypeHelper";

import { toggleHuddle } from "@/Store/huddleSlice";
import { deleteFileInThread, setThreadedMessageId } from "@/Store/threadSlice";
import { deleteFile } from "@/Store/messagesSlice";

export default function Event() {
    const {
        workspace,

        auth,
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
            .joining((user) => {
                dispatch(setOnlineStatus({ user, onlineStatus: true }));
            })
            .leaving((user) => {
                dispatch(setOnlineStatus({ user, onlineStatus: false }));
            })
            .listen("WorkspaceEvent", (e) => {
                switch (e.type) {
                    case "ChannelObserver_storeChannel":
                        break;
                    case "ChannelObserver_deleteChannel":
                        if (huddleChannel && huddleChannel?.id == e?.data) {
                            dispatch(toggleHuddle());
                        }

                        break;

                    case "FileObserver_fileDeleted":
                        dispatch(deleteFile(e.data));
                        dispatch(deleteFileInThread(e.data));
                        break;
                    case "UserObserver_updated":
                        router.reload({
                            preserveState: true,
                            only: ["channelUsers", "users"],
                        });
                    default:
                        break;
                }
            })
            .error((error) => {
                console.error(error);
            });
        return () => {
            connectionRef.current = null;
            Echo.leave(`workspaces.${workspace.id}`);
        };
    }, [workspace.id, huddleChannel]);
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
