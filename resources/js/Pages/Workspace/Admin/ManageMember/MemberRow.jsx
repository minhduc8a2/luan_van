import AvatarAndName from "@/Components/AvatarAndName";
import CustomedDialog from "@/Components/CustomedDialog";
import CustomedPopover from "@/Components/CustomedPopover";
import React, { useState } from "react";
import { IoIosMore } from "react-icons/io";
import ChangeAccountType from "./ChangeAccountType";
import RemoveFromWorkspace from "./RemoveFromWorkspace";
import { UTCToDateTime } from "@/helpers/dateTimeHelper";
import { useSelector } from "react-redux";

export default function MemberRow({ user }) {
    const { workspace } = useSelector((state) => state.workspace);
    const [isChangeAccountTypeOpen, setIsChangeAccountTypeOpen] =
        useState(false);
    const [isRemoveFromWorkspaceOpen, setIsRemoveFromWorkspaceOpen] =
        useState(false);
    return (
        <div className="flex gap-x-4  border-b border-b-color/15">
            <ChangeAccountType
                isOpen={isChangeAccountTypeOpen}
                onClose={() => setIsChangeAccountTypeOpen(false)}
                user={user}
            />
            <RemoveFromWorkspace
                isOpen={isRemoveFromWorkspaceOpen}
                onClose={() => setIsRemoveFromWorkspaceOpen(false)}
            />
            <div className="flex justify-between border-r border-r-color/15 flex-1  py-2 px-2">
                <AvatarAndName user={user} className="h-6 w-6" noStatus />
                {user.id != workspace.user_id && (
                    <CustomedPopover
                        anchor="left end"
                        triggerNode={
                            <div>
                                {" "}
                                <IoIosMore className="text-2xl" />
                            </div>
                        }
                    >
                        <CustomedPopover.ListItem
                            onClick={() => setIsChangeAccountTypeOpen(true)}
                        >
                            Change account type
                        </CustomedPopover.ListItem>
                        <CustomedPopover.ListItem
                            onClick={() => setIsRemoveFromWorkspaceOpen(true)}
                            className="text-danger-500"
                        >
                            Deactivate user
                        </CustomedPopover.ListItem>
                    </CustomedPopover>
                )}
            </div>
            <div className="w-48 text-left py-2 text-color-medium-emphasis text-sm">
                {user.display_name}
            </div>
            <div className="w-96 text-left py-2 text-color-medium-emphasis text-sm">
                {user.email}
            </div>
            <div className="w-48 text-left py-2 text-color-medium-emphasis text-sm">
                {workspace.user_id == user.id
                    ? "OWNER"
                    : user.workspaceRole?.name}
            </div>
            <div className="w-48 text-left py-2 text-color-medium-emphasis text-sm">
                {UTCToDateTime(user.pivot?.created_at)}
            </div>
        </div>
    );
}
