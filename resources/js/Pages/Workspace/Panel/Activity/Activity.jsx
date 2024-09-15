import { router, usePage } from "@inertiajs/react";
import React from "react";
import { FaToggleOff } from "react-icons/fa6";
import { useEffect } from "react";
import {
    isChannelsNotification,
    isHuddleInvitationNotificationType,
    isMentionNotification,
} from "@/helpers/notificationTypeHelper";
import { useDispatch, useSelector } from "react-redux";
import { setAsRead, setAsView } from "@/Store/activitySlice";
import HuddleNotification from "./HuddleNotification";
import MentionNotification from "./MentionNotification";
import ChannelNotification from "./ChannelNotification";
export default function Activity() {
    const { notifications } = useSelector((state) => state.activity);
    const { type: panelType } = useSelector((state) => state.panel);
    const dispatch = useDispatch();
    function handleNotificationClick(notification, trailingAction) {
        if (notification.view_at == null)
            router.post(
                route("notifications.mark_view", notification.id),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        dispatch(setAsView(notification.id));
                        trailingAction();
                    },
                }
            );
        else trailingAction();
    }
    useEffect(() => {
        return () => {
            if (panelType == "activity") {
                if (
                    notifications.some(
                        (notification) => notification.read_at == null
                    )
                )
                    router.post(
                        route("notifications.mark_read"),
                        {},
                        {
                            preserveState: true,
                            preserveScroll: true,
                            onSuccess: () => {
                                dispatch(setAsRead());
                            },
                        }
                    );
            }
        };
    }, [panelType]);

    return (
        <div className="bg-secondary flex flex-col max-h-full min-h-0 rounded-l-lg rounded-s-lg pb-4">
            <div className="flex justify-between items-end p-4">
                <h3 className="text-xl font-semibold">Activity</h3>

                <div className="flex gap-x-2 items-center">
                    <div className="text-sm  text-white/60">Unreads</div>
                    <FaToggleOff className="text-2xl text-white/60" />
                </div>
            </div>

            <ul className="overflow-y-auto flex-1 scrollbar  ">
                {notifications.map((notification, index) => {
                    if (isHuddleInvitationNotificationType(notification.type)) {
                        return (
                            <HuddleNotification
                                notification={notification}
                                key={notification.id}
                                handleNotificationClick={
                                    handleNotificationClick
                                }
                            />
                        );
                    } else if (isMentionNotification(notification.type)) {
                        return (
                            <MentionNotification
                                notification={notification}
                                key={notification.id}
                                handleNotificationClick={
                                    handleNotificationClick
                                }
                            />
                        );
                    } else if (isChannelsNotification(notification.type)) {
                        return (
                            <ChannelNotification
                                notification={notification}
                                key={notification.id}
                                handleNotificationClick={
                                    handleNotificationClick
                                }
                            />
                        );
                    }
                })}
            </ul>
        </div>
    );
}
