import { router, usePage } from "@inertiajs/react";
import React, { useContext, useMemo, useRef } from "react";
import { FaToggleOff } from "react-icons/fa6";
import { useEffect } from "react";
import {
    isChannelsNotification,
    isHuddleInvitationNotificationType,
    isMentionNotification,
} from "@/helpers/notificationTypeHelper";
import { useDispatch, useSelector } from "react-redux";
import {
    pushManyActivity,
    setActivity,
    setAsRead,
    setAsView,
    setNotificationsCount,
} from "@/Store/activitySlice";
import { useState } from "react";
import HuddleNotification from "./HuddleNotification";
import MentionNotification from "./MentionNotification";
import ChannelNotification from "./ChannelNotification";
import axios from "axios";
import { InView } from "react-intersection-observer";
import LoadingSpinner from "@/Components/LoadingSpinner";
import { FaToggleOn } from "react-icons/fa";
import { useParams } from "react-router-dom";
import ThemeContext from "@/ThemeProvider";
export default function Activity() {
    const { workspaceId } = useParams();
    const { theme } = useContext(ThemeContext);
    const { leftWindowType } = useSelector((state) => state.windowType);
    const nextPageUrlRef = useRef(null);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const { notifications } = useSelector((state) => state.activity);
    const notificationContainerRef = useRef(null);
    const prevScrollHeightRef = useRef(null);
    const [onlyUnread, setOnlyUnread] = useState(false);
    function handleNotificationClick(notification, trailingAction) {
        if (notification.view_at == null)
            axios
                .get(
                    route("notifications.mark_view", {
                        workspace: workspaceId,
                        notification: notification.id,
                    })
                )
                .then(() => {
                    dispatch(setAsView(notification.id));
                    trailingAction();
                });
        else trailingAction();
    }
    useEffect(() => {
        setLoading(true);
        axios.get(route("notifications.get", workspaceId)).then((response) => {
            nextPageUrlRef.current = response.data?.next_page_url;
            console.log(response);
            dispatch(setActivity(response.data?.data));
            setLoading(false);
        });
        return () => {
            dispatch(setActivity([]));
        };
    }, []);
    useEffect(() => {
        return () => {
            if (leftWindowType == "activity") {
                console.log("IN ACTIVITY");
                dispatch(setNotificationsCount(0));
                if (
                    notifications.some(
                        (notification) => notification.read_at == null
                    )
                )
                    axios
                        .post(route("notifications.mark_read", workspaceId), {})
                        .then(() => {
                            dispatch(setAsRead());
                        });
            }
        };
    }, [leftWindowType]);
    const filteredNotifications = useMemo(() => {
        return notifications.filter((notification) => {
            if (onlyUnread) return !notification.view_at;
            else return true;
        });
    }, [notifications, onlyUnread]);
    return (
        <div
            className={`${
                theme.mode ? "bg-black/35" : "bg-white/15"
            } bg-black/35 flex flex-col h-full rounded-l-lg rounded-s-lg pb-4`}
        >
            <div className="flex justify-between items-end p-4">
                <h3 className="text-xl font-semibold">Activity</h3>

                <button
                    className="flex gap-x-2 items-center group"
                    onClick={() => setOnlyUnread((pre) => !pre)}
                >
                    <div className="text-sm  text-white/75 transition-all group-hover:text-white">
                        Unreads
                    </div>
                    {onlyUnread ? (
                        <FaToggleOn className="text-2xl text-white/75 transition-all group-hover:text-white" />
                    ) : (
                        <FaToggleOff className="text-2xl text-white/75 transition-all group-hover:text-white" />
                    )}
                </button>
            </div>

            <ul
                className="overflow-y-auto flex-1 scrollbar  relative"
                ref={notificationContainerRef}
            >
                {loading && notifications.length == 0 && (
                    <LoadingSpinner spinerStyle="border-white" />
                )}
                {filteredNotifications.map((notification, index) => {
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
                <InView
                    onChange={(inView, entry) => {
                        console.log(inView);
                        if (inView && nextPageUrlRef.current) {
                            prevScrollHeightRef.current =
                                notificationContainerRef.current.scrollHeight;
                            axios
                                .get(nextPageUrlRef.current)
                                .then((response) => {
                                    if (response.status == 200) {
                                        nextPageUrlRef.current =
                                            response.data.next_page_url;

                                        dispatch(
                                            pushManyActivity(response.data.data)
                                        );
                                    }
                                });
                        }
                    }}
                ></InView>
            </ul>
        </div>
    );
}
