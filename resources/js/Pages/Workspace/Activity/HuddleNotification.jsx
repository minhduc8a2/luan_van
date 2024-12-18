import { router, usePage } from "@inertiajs/react";
import React from "react";
import { FiHeadphones } from "react-icons/fi";
import Avatar from "@/Components/Avatar";
import { UTCToDateTime } from "@/helpers/dateTimeHelper";
import { toggleHuddle } from "@/Store/huddleSlice";
import { isHuddleInvitationNotificationBroadcast } from "@/helpers/notificationTypeHelper";
import { useDispatch, useSelector } from "react-redux";
import { getChannelName } from "@/helpers/channelHelper";
import { useMemo } from "react";
import { setNotificationPopup } from "@/Store/notificationPopupSlice";
import { useParams } from "react-router-dom";
export default function HuddleNotification({
    notification,
    handleNotificationClick,
}) {
    const { auth } = usePage().props;
    const {workspaceId} = useParams()
    const { workspace: currentWorkspace } = useSelector(
        (state) => state.workspace
    );
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const dispatch = useDispatch();
    const { channelId: huddleChannelId } = useSelector((state) => state.huddle);
    const { byUser, channel, workspace } =
        isHuddleInvitationNotificationBroadcast(notification.type)
            ? notification
            : notification.data;

    const read_at = notification.read_at;
    const created_at = notification.created_at;
    const view_at = notification.view_at;

    function handleNotificationClickedPart() {
        axios
            .get(route("channels.checkExists", workspaceId), {
                params: { channelId: channel.id },
            })
            .then((response) => {
                let result = response?.data?.result;
                if (!result) {
                    dispatch(
                        setNotificationPopup({
                            title: "Error",
                            messages: ["Channel not found"],
                            type: "error",
                        })
                    );
                    return;
                }
                if (huddleChannelId == channel.id) return;
                if (huddleChannelId && huddleChannelId != channel.id) {
                    if (
                        confirm(
                            "Are you sure you want to switch to other huddle"
                        )
                    ) {
                        if (workspace.id != currentWorkspace.id) {
                            router.get(
                                route("channels.show", {
                                    workspace: workspace.id,
                                    channel: channel.id,
                                }),
                                {},
                                {
                                    preserveState: true,

                                    onSuccess: () =>
                                        dispatch(
                                            toggleHuddle({
                                                channelId: channel.id,
                                                user: auth.user,
                                            })
                                        ),
                                }
                            );
                        } else
                            dispatch(
                                toggleHuddle({
                                    channelId: channel.id,
                                    user: auth.user,
                                })
                            );
                    }
                } else {
                    if (workspace.id != currentWorkspace.id) {
                        router.get(
                            route("channels.show", {
                                workspace: workspace.id,
                                channel: channel.id,
                            }),
                            {},
                            {
                                preserveState: true,
                                onSuccess: () =>
                                    dispatch(
                                        toggleHuddle({
                                            channelId: channel.id,
                                            user: auth.user,
                                        })
                                    ),
                            }
                        );
                    } else
                        dispatch(
                            toggleHuddle({
                                channelId: channel.id,
                                user: auth.user,
                            })
                        );
                }
            });
    }
    const channelName = useMemo(
        () => getChannelName(channel, workspaceUsers, auth.user),
        [channel, workspaceUsers, auth]
    );
    return (
        <li>
            <button
                className={`p-4 pl-8  hover:bg-color/15 border-t border-color/15 ${
                    read_at != null ? "" : "bg-primary-300/15"
                }`}
                onClick={() => {
                    handleNotificationClick(
                        notification,
                        handleNotificationClickedPart
                    );
                }}
            >
                <div className="flex gap-x-1 items-center mb-4">
                    <FiHeadphones className="text-sm" />
                    <div className="text-sm font-semibold text-white/75">
                        Huddle in{" "}
                        <span className="font-bold">#{channelName}</span> (
                        <span className="">{workspace.name}</span>)
                    </div>
                </div>
                <div className="flex gap-x-2 justify-between">
                    <div className={`message-container  flex-1 `}>
                        <Avatar
                            src={byUser.avatar_url}
                            className="w-8 h-8"
                            noStatus={true}
                        />
                        <div className="mx-2 ">
                            <div className="flex gap-x-2 items-center">
                                <div className="text-sm font-bold">
                                    {byUser.name}
                                </div>
                                <div className="text-xs">
                                    {UTCToDateTime(created_at)}
                                </div>
                            </div>
                            <div className="text-left">
                                {`${byUser.name} has invited you to join huddle in channel `}{" "}
                                <span className="font-bold">
                                    #{channelName}
                                </span>{" "}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div
                            className={`${
                                view_at == null ? "bg-blue-500" : ""
                            } rounded-full w-3 h-3`}
                        ></div>
                    </div>
                </div>
            </button>
        </li>
    );
}
