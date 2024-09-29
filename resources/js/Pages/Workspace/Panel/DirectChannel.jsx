import { usePage, Link } from "@inertiajs/react";
import Avatar from "@/Components/Avatar";
import { router } from "@inertiajs/react";
import { useSelector } from "react-redux";
import { channelProps } from "@/helpers/channelHelper";
import { useMemo } from "react";
export function DirectChannel({ channel, user, isOnline = false }) {
    const { auth,channelId,  workspace } = usePage().props;
    const { channels } = useSelector((state) => state.channels);

    const currentChannel = useMemo(
        () => channels.find((cn) => cn.id == channelId),
        [channels, channelId]
    );
    const onlineStatusMap = useSelector((state) => state.onlineStatus);
  
    function changeChannel() {
        router.get(
            route("channels.show", {
                workspace: workspace.id,
                channel: channel.id,
            }),
            {},
            {
                preserveState: true,
                only: channelProps,
            }
        );
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
