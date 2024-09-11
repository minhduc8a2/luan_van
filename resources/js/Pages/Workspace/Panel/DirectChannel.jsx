import { usePage, Link } from "@inertiajs/react";
import Avatar from "@/Components/Avatar";
import { router } from "@inertiajs/react";
import { useSelector } from "react-redux";
export function DirectChannel({ channel, user, isOnline = false }) {
    const {
        auth,
        channel: currentChannel,
    } = usePage().props;
    const onlineStatusMap = useSelector((state) => state.onlineStatus);
    function changeChannel() {
        router.get(
            route("channel.show", channel.id),
            {},
            {
                preserveState: true,
            }
        );
    }
    return (
        <li>
            <button
                onClick={changeChannel}
                className={`flex mt-2 items-center justify-start gap-x-2 px-4 py-1 rounded-lg w-full ${
                    channel.id == currentChannel.id
                        ? "bg-primary-lighter"
                        : "hover:bg-white/10"
                }`}
            >
                <div className="">
                    <Avatar
                        src={user.avatar_url}
                        className="w-5 h-5"
                        onlineClassName="scale-75"
                        offlineClassName="scale-75"
                        isOnline={isOnline || onlineStatusMap[user.id]}
                    />
                </div>
                <div className="">
                    {user.name}{" "}
                    {user.id == auth.user.id ? (
                        <span className="opacity-75 ml-2">you</span>
                    ) : (
                        ""
                    )}
                </div>
            </button>
        </li>
    );
}
