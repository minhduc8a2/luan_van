import { usePage, Link } from "@inertiajs/react";
import Avatar from "@/Components/Avatar";
import { useDispatch } from "react-redux";
import { setChannel } from "@/Store/Slices/channelSlice";
export function DirectChannel({ channel, user }) {
    const { auth } = usePage().props;
    const dispatch = useDispatch();
    function changeChannel() {
        dispatch(setChannel({ ...channel, name: user.name }));
    }
    return (
        <li>
            <button
                onClick={changeChannel}
                className="flex mt-2 items-center justify-start gap-x-2 px-4 "
            >
                <div className="">
                    <Avatar
                        src={user.avatar_url}
                        className="w-5 h-5"
                        onlineClassName="scale-75"
                        offlineClassName="scale-75"
                        isOnline={user.online}
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
