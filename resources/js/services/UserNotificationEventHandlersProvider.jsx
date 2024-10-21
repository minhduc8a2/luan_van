import { usePage } from "@inertiajs/react";
import React from "react";

import ChannelEventEnum from "./ChannelEventsEnum";

export default function UserNotificationEventHandlersProvider({ children }) {
    const { auth } = usePage().props;
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
                        case ChannelEventEnum.ADDED_TO_NEW_CHANNEL:
                            dispatch(addNewChannelToChannelsStore(channel));

                            if (
                                channelsDataRef.current.hasOwnProperty(
                                    channelIdRef.current
                                )
                            ) {
                                reloadPermissions(channelIdRef.current);
                            }
                            break;
                        case ChannelEventEnum.REMOVED_FROM_CHANNEL:
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
    return <>{children}</>;
}
