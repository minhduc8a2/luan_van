import Button from "@/Components/Button";
import CustomedPopover from "@/Components/CustomedPopover";
import React, { useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import HideUser from "./HideUser";
import { router, usePage } from "@inertiajs/react";
import { useDispatch } from "react-redux";
import { updateProfileInformation } from "@/Store/profileSlice";

export default function MoreOptions({ user }) {
    const [hideUserOpen, setHideUserOpen] = useState(false);
    const { workspace } = usePage().props;
    const dispatch = useDispatch();
    function unhideUser() {
        router.post(
            route("users.hide"),
            { userId: user.id, workspaceId: workspace.id, mode: "unhide" },
            {
                preserveState: true,
                onError: (errors) => {
                    dispatch(
                        setNotificationPopup({
                            type: "error",
                            messages: Object.values(errors),
                        })
                    );
                },
                onSuccess: () => {
                    dispatch(updateProfileInformation({ is_hidden: false }));
                },
            }
        );
    }
    return (
        <>
            <CustomedPopover
                width="w-80"
                anchor="bottom end"
                className="mt-1 bg-foreground"
                triggerNode={
                    <Button>
                        <div className="flex items-center">
                            <FiMoreVertical className="text-lg" />
                        </div>
                    </Button>
                }
            >
                {!user.is_hidden && (
                    <CustomedPopover.ListItem
                        className="!text-danger-400 hover:!bg-danger-500 hover:!text-white"
                        onClick={() => {
                            setHideUserOpen(true);
                        }}
                    >
                        Hide {user.displayName || user.name}
                    </CustomedPopover.ListItem>
                )}
                {user.is_hidden && (
                    <CustomedPopover.ListItem className="" onClick={unhideUser}>
                        Unhide {user.displayName || user.name}
                    </CustomedPopover.ListItem>
                )}
            </CustomedPopover>
            <HideUser
                user={user}
                isOpen={hideUserOpen}
                onClose={() => setHideUserOpen(false)}
            />
        </>
    );
}
