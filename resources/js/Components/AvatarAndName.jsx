import React, { memo } from "react";
import Avatar from "./Avatar";
import { usePage } from "@inertiajs/react";
const AvatarAndName = memo(function ({ user, description, ...props }) {
    const { auth } = usePage().props;
    return (
        <div className="flex items-center justify-start gap-x-2  ">
            <div className="">
                <Avatar src={user.avatar_url} {...props} />
            </div>
            <div className="flex flex-col justify-between text-color-high-emphasis">
                <div className="">
                    {user.display_name || user.name}{" "}
                    {user.id == auth.user.id ? (
                        <span className="opacity-75 ml-2">you</span>
                    ) : (
                        ""
                    )}
                </div>
                {description}
            </div>
        </div>
    );
});
export default AvatarAndName;
