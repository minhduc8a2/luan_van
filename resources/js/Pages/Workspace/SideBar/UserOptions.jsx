import Avatar from "@/Components/Avatar";
import AvatarAndName from "@/Components/AvatarAndName";
import CustomedPopover from "@/Components/CustomedPopover";
import { setProfile } from "@/Store/profileSlice";

import { usePage } from "@inertiajs/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function UserOptions() {
    const { auth } = usePage().props;
    const { workspace } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();

    return (
        <CustomedPopover
            anchor="top start"
            triggerNode={
                <Avatar
                    src={auth.user.avatar_url}
                    className="mt-2 h-10 w-10"
                    isOnline={true}
                />
            }
        >
            <div className="px-4 my-4">
                <AvatarAndName
                    noStatus
                    className="w-10 h-10"
                    user={auth.user}
                    description={
                        <div className="flex gap-x-2 items-center text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-600"></div>
                            Active
                        </div>
                    }
                />
            </div>
            <CustomedPopover.ListItem
                onClick={() => {
                    dispatch(setProfile(auth.user.id));
                }}
            >
                Profile
            </CustomedPopover.ListItem>
            <CustomedPopover.ListItem>
                <Link to="/workspaces">
                    Sign out of{" "}
                    <span className="font-bold capitalize">
                        {workspace.name}
                    </span>
                </Link>
            </CustomedPopover.ListItem>
        </CustomedPopover>
    );
}
