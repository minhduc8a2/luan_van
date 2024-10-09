import { usePage, Link } from "@inertiajs/react";
import Avatar from "@/Components/Avatar";
import { useSelector } from "react-redux";
import {  useParams } from "react-router-dom";
import { useChannel } from "@/helpers/customHooks";

import useGoToChannel from "@/helpers/useGoToChannel";
export function DirectChannel({ channel, user, isOnline = false }) {
    const { auth } = usePage().props;
    const { channelId } = useParams();

    const goToChannel = useGoToChannel();
    const { channel: currentChannel } = useChannel(channelId);
    const onlineStatusMap = useSelector((state) => state.onlineStatus);

    function changeChannel() {
        goToChannel(channel.workspace_id,channel.id);
    }
    return (
        <li>
            <button
                onClick={changeChannel}
                className={`flex mt-2 items-center justify-between gap-x-2 px-4 py-1 rounded-lg w-full ${
                    channel.id == currentChannel?.id
                        ? "bg-primary-300"
                        : "hover:bg-white/10"
                }`}
            >
                <div className="flex gap-x-2">
                    <Avatar
                        src={user.avatar_url}
                        className="w-5 h-5"
                        onlineClassName="scale-75"
                        offlineClassName="scale-75"
                        isOnline={isOnline || onlineStatusMap[user.id]}
                    />
                    <div className="">
                        {user.display_name || user.name}{" "}
                        {user.id == auth.user.id ? (
                            <span className="opacity-75 ml-2">you</span>
                        ) : (
                            ""
                        )}
                    </div>
                </div>
                <div className="text-sm text-white">
                    {channel.unread_messages_count
                        ? channel.unread_messages_count
                        : ""}
                </div>
            </button>
        </li>
    );
}
