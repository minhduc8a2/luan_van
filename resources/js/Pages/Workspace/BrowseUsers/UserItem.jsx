import Image from "@/Components/Image";
import Tooltip from "@/Components/Tooltip";
import { setProfile } from "@/Store/profileSlice";
import { usePage } from "@inertiajs/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

export default function UserItem({ user }) {
    const { default_avatar_url, auth } = usePage().props;
    const onlineStatusMap = useSelector((state) => state.onlineStatus);
    const isOnline = onlineStatusMap[user.id];
    const dispatch = useDispatch();
    return (
        <div
            className="w-48 aspect-[2/3] bg-background rounded-lg"
            onClick={() => {
                if (user.id == auth.user.id) {
                    dispatch(setProfile(auth.user));
                } else {
                    dispatch(setProfile(user));
                }
            }}
        >
            <Image
                clickAble={false}
                url={user.avatar_url || default_avatar_url}
                dimensions="w-full aspect-square"
                noToolbar
            />
            <div className="p-4 font-bold flex gap-x-2 items-center">
                {user.displayName || user.name}{" "}
                <Tooltip content={isOnline ? "Active" : "Away"}>
                    <div
                        className={`h-2 w-2 rounded-full ${
                            isOnline ? "bg-green-600" : "border border-white/25"
                        } `}
                    ></div>
                </Tooltip>
            </div>
        </div>
    );
}
