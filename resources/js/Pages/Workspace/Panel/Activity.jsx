import { router, usePage } from "@inertiajs/react";
import React from "react";
import { FaToggleOff } from "react-icons/fa6";
import { useEffect } from "react";
import {
    isHuddleInvitationNotificationBroadcast,
    isHuddleInvitationNotificationType,
} from "@/helpers/type";
import { FiHeadphones } from "react-icons/fi";
import Avatar from "@/Components/Avatar";
import { useDispatch, useSelector } from "react-redux";
import { UTCToDateTime } from "@/helpers/dateTimeHelper";
import { setAsRead , setAsView} from "@/Store/activitySlice";
export default function Activity() {
    const { auth } = usePage().props;
    const { notifications } = useSelector((state) => state.activity);
    const { type: panelType } = useSelector((state) => state.panel);
    const dispatch = useDispatch();
    function handleNotificationClick(notification) {
        if (notification.view_at == null)
            router.post(
                route("notifications.mark_view", notification.id),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        dispatch(setAsView(notification.id));
                    },
                }
            );
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
                        const { fromUser, toUser, channel, workspace } =
                            isHuddleInvitationNotificationBroadcast(
                                notification.type
                            )
                                ? notification
                                : notification.data;
                        const read_at = notification.read_at;
                        const created_at = notification.created_at;
                        const view_at = notification.view_at;
                        return (
                            <li key={notification.id}>
                                <button
                                    className={`p-4 pl-8  hover:bg-white/15 border-t border-white/15 ${
                                        read_at != null
                                            ? ""
                                            : "bg-primary-lighter/15"
                                    }`}
                                    onClick={() =>
                                        handleNotificationClick(notification)
                                    }
                                >
                                    <div className="flex gap-x-2 items-center mb-4">
                                        <FiHeadphones />
                                        <div className="">Huddle</div>
                                    </div>
                                    <div className="flex gap-x-2">
                                        <div className={`message-container   `}>
                                            <Avatar
                                                src={"/storage/bot.png"}
                                                className="w-8 h-8"
                                                noStatus={true}
                                            />
                                            <div className="mx-2 ">
                                                <div className="flex gap-x-2 items-center">
                                                    <div className="text-sm font-bold">
                                                        Snackbot
                                                    </div>
                                                    <div className="text-xs">
                                                        {UTCToDateTime(
                                                            created_at
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-left">
                                                    {`${fromUser.name} has invited you to join huddle in channel `}{" "}
                                                    <span className="font-bold">
                                                        {channel.name}
                                                    </span>{" "}
                                                    (
                                                    <span className="">
                                                        {workspace.name}
                                                    </span>
                                                    )
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <div
                                                className={`${
                                                    view_at == null
                                                        ? "bg-blue-500"
                                                        : ""
                                                } rounded-full w-3 h-3`}
                                            ></div>
                                        </div>
                                    </div>
                                </button>
                            </li>
                        );
                    }
                })}
            </ul>
        </div>
    );
}
