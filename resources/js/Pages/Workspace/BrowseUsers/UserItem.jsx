import Image from "@/Components/Image";
import Tooltip from "@/Components/Tooltip";
import { setProfile } from "@/Store/profileSlice";
import { usePage } from "@inertiajs/react";
import React from "react";
import { LiaUserMinusSolid } from "react-icons/lia";
import { useDispatch, useSelector } from "react-redux";
import defaultAvatar from "@/../images/default_avatar.png"
export default function UserItem({ user }) {
    
    const onlineStatusMap = useSelector((state) => state.onlineStatus);
    const isOnline = onlineStatusMap[user.id];
    const dispatch = useDispatch();
    return (
        <div
            className="w-48 aspect-[2/3] bg-background rounded-lg border border-color/15 cursor-pointer"
            onClick={() => {
                dispatch(setProfile(user.id));
            }}
        >
            {user.is_hidden ? (
                <div className="w-full aspect-square bg-foreground rounded-lg flex items-center justify-center mx-auto">
                    <LiaUserMinusSolid className="text-5xl" />
                </div>
            ) : (
                <Image
                    clickAble={false}
                    url={user.avatar_url || defaultAvatar}
                    dimensions="w-full aspect-square"
                    noToolbar
                />
            )}

            <div className="p-4 font-bold flex gap-x-2 items-center text-color-high-emphasis">
                {user.is_hidden
                    ? "Name hidden"
                    : user.display_name || user.name}
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
