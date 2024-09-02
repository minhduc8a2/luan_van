import React from "react";
import Avatar from "./Avatar";
import { usePage } from "@inertiajs/react";
export default function AvatarAndName({ user, ...props }) {
    const { auth } = usePage().props;
    return (
        <div className="flex items-center justify-start gap-x-2  ">
            <div className="">
                <Avatar src={user.avatar_url} {...props} />
            </div>
            <div className="">
                {user.name}{" "}
                {user.id == auth.user.id ? (
                    <span className="opacity-75 ml-2">you</span>
                ) : (
                    ""
                )}
            </div>
        </div>
    );
}
