import { usePage, Link } from "@inertiajs/react";
import Avatar from "@/Components/Avatar";
export function DirectChannel({ channel, user }) {
    const { auth } = usePage().props;
    console.log(user);
    return (
        <li>
            <Link
                href={route("channel.show", channel.id)}
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
            </Link>
        </li>
    );
}
