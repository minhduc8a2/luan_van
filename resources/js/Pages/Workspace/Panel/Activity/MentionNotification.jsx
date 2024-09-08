import { router, usePage } from "@inertiajs/react";
import React from "react";
import { FiHeadphones } from "react-icons/fi";
import Avatar from "@/Components/Avatar";
import { UTCToDateTime } from "@/helpers/dateTimeHelper";
import { VscMention } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { isMentionNotificationBroadcast } from "@/helpers/notificationTypeHelper";
import { getChannelName } from "@/helpers/channelHelper";
import { setMessageId } from "@/Store/mentionSlice";
import { setMessages } from "@/Store/messagesSlice";
export default function MentionNotification({
    notification,
    handleNotificationClick,
}) {
    const {
        auth,
        users: workspaceUsers,
        messages: initMessages,
    } = usePage().props;

    const { fromUser, toUser, channel, workspace, message } =
        isMentionNotificationBroadcast(notification.type)
            ? notification
            : notification.data;
    const read_at = notification.read_at;
    const created_at = notification.created_at;
    const view_at = notification.view_at;
    const dispatch = useDispatch();
    function handleNotificationClickedPart() {
        router.get(
            route("channel.show", channel.id),
            { message_id: message.id },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => {
                  
                    dispatch(setMessageId(message.id));
                   
                },
            }
        );
    }
    return (
        <li>
            <button
                className={`p-4 pl-8 w-full hover:bg-white/15 border-t border-white/15 ${
                    read_at != null ? "" : "bg-primary-lighter/15"
                }`}
                onClick={() => {
                    handleNotificationClick(
                        notification,
                        handleNotificationClickedPart
                    );
                }}
            >
                <div className="flex  items-center mb-4">
                    <VscMention className="text-lg" />
                    <div className="text-sm font-semibold text-white/75">
                        Mention in{" "}
                        <span className="font-bold">
                            #
                            {getChannelName(channel, auth.user, workspaceUsers)}
                        </span>{" "}
                        (<span className="">{workspace.name}</span>)
                    </div>
                </div>
                <div className="flex gap-x-2 justify-between">
                    <div className={`message-container   flex-1`}>
                        <Avatar
                            src={fromUser.avatar_url}
                            className="w-8 h-8"
                            noStatus={true}
                        />
                        <div className="mx-2 ">
                            <div className="flex gap-x-2 items-center">
                                <div className="text-sm font-bold">
                                    {fromUser.name}
                                </div>
                                <div className="text-xs">
                                    {UTCToDateTime(created_at)}
                                </div>
                            </div>
                            <div className="text-left">
                                <div
                                    className="prose prose-invert "
                                    dangerouslySetInnerHTML={{
                                        __html: message.content,
                                    }}
                                ></div>
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
