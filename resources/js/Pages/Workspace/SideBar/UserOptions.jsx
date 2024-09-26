import Avatar from "@/Components/Avatar";
import AvatarAndName from "@/Components/AvatarAndName";
import CustomedPopover from "@/Components/CustomedPopover";
import { setProfile } from "@/Store/profileSlice";
import { useClose } from "@headlessui/react";
import { usePage } from "@inertiajs/react";
import React from "react";
import { useDispatch } from "react-redux";

export default function UserOptions() {
    const { auth } = usePage().props;
    const dispatch = useDispatch();
    const close = useClose();
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
                    dispatch(setProfile(auth.user));
                    close();
                }}
            >
                Profile
            </CustomedPopover.ListItem>
            <CustomedPopover.ListItem>
                Sign out of Main
            </CustomedPopover.ListItem>
        </CustomedPopover>
    );
}
