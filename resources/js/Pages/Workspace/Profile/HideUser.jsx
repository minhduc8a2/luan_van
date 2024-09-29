import Button from "@/Components/Button";
import CustomedDialog from "@/Components/CustomedDialog";
import CustomedPopover from "@/Components/CustomedPopover";
import { setNotificationPopup } from "@/Store/notificationPopupSlice";
import { updateWorkspaceUserInformation } from "@/Store/workspaceUsersSlice";
import { router, usePage } from "@inertiajs/react";
import React, { useState } from "react";
import { FiBellOff } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";
import { RiUserForbidLine } from "react-icons/ri";
import { useDispatch } from "react-redux";

export default function HideUser({ user, isOpen, onClose }) {
    const { workspace } = usePage().props;
    const dispatch = useDispatch();

    function hideUser() {
        router.post(
            route("users.hide"),
            { userId: user.id, workspaceId: workspace.id, mode: "hide" },
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
                    onClose();
                    dispatch(
                        updateWorkspaceUserInformation({
                            id: user.id,
                            data: { is_hidden: true },
                        })
                    );
                },
            }
        );
    }
    return (
        <>
            <CustomedDialog
                isOpen={isOpen}
                onClose={onClose}
                className="w-[500px]"
            >
                <CustomedDialog.Title>
                    Hide {user.displayName || user.name}?
                </CustomedDialog.Title>
                <div className="flex flex-col gap-y-4">
                    <div className="flex gap-x-6 items-center">
                        <RiUserForbidLine className="text-4xl" />
                        <p>
                            Their messages in channels will be hidden from you,
                            and you won’t be notified when they mention or DM
                            you.
                        </p>
                    </div>
                    <div className="flex  gap-x-6 items-center">
                        <IoSettingsOutline className="text-2xl" />
                        <p>You can always unhide them later.</p>
                    </div>
                    <div className="flex  gap-x-6 items-center">
                        <FiBellOff className="text-xl" />
                        <p>They won’t be notified that you’ve hidden them.</p>
                    </div>
                </div>
                <div className="flex justify-end gap-x-4 mt-8">
                    <Button onClick={onClose}>Close</Button>
                    <Button type="danger" onClick={hideUser}>
                        Hide This Person
                    </Button>
                </div>
            </CustomedDialog>
        </>
    );
}
