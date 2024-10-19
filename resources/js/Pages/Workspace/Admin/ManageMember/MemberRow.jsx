import AvatarAndName from "@/Components/AvatarAndName";

import CustomedPopover from "@/Components/CustomedPopover";
import React, { useState } from "react";
import { IoIosMore } from "react-icons/io";
import ChangeAccountType from "./ChangeAccountType";
import DeactivateUser from "./DeactivateUser";
import { UTCToDateTime } from "@/helpers/dateTimeHelper";
import { useSelector } from "react-redux";

export default function MemberRow({ user }) {
    const { workspace } = useSelector((state) => state.workspace);
    const [isChangeAccountTypeOpen, setIsChangeAccountTypeOpen] =
        useState(false);
    const [isDeactivateUserOpen, setIsDeactivateUserOpen] = useState(false);
    const onlineStatusMap = useSelector((state) => state.onlineStatus);
    return (
        <div
            className={`flex gap-x-4 min-w-full border-b border-b-color/15 w-fit ${
                user.pivot?.is_deactivated ? "opacity-75" : ""
            }`}
        >
            <ChangeAccountType
                isOpen={isChangeAccountTypeOpen}
                onClose={() => setIsChangeAccountTypeOpen(false)}
                user={user}
            />
            <DeactivateUser
                isOpen={isDeactivateUserOpen}
                onClose={() => setIsDeactivateUserOpen(false)}
                user={user}
            />
            <div className="flex justify-between border-r border-r-color/15  min-w-96  py-2 px-2">
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
                            onClick={() => setIsDeactivateUserOpen(true)}
                            className={
                                user.pivot?.is_deactivated
                                    ? ""
                                    : "text-danger-500"
                            }
                        >
                            {user.pivot?.is_deactivated
                                ? "Activate account"
                                : "Deactivate account"}
                        </CustomedPopover.ListItem>
                    </CustomedPopover>
                )}
            </div>
            <div className="min-w-48 text-left py-2 text-color-medium-emphasis text-sm">
                {user.display_name}
            </div>
            <div className="min-w-48 text-left py-2 text-color-medium-emphasis text-sm">
                {user.email}
            </div>
            <div className="min-w-48 text-left py-2 text-color-medium-emphasis text-sm">
                {workspace.user_id == user.id
                    ? "OWNER"
                    : user.workspaceRole?.name}
            </div>
            <div className="min-w-48 text-left py-2 text-color-medium-emphasis text-sm">
                {user.pivot?.is_deactivated
                    ? "Deactivated"
                    : onlineStatusMap[user.id]
                    ? "Active"
                    : "Inactive"}
            </div>
            <div className="min-w-48 text-left py-2 text-color-medium-emphasis text-sm">
                {UTCToDateTime(user.pivot?.created_at)}
            </div>
        </div>
    );
}
