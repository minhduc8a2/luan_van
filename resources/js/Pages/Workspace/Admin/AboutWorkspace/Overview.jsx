import WorkspaceAvatar from "@/Components/WorkspaceAvatar";
import { formatDateWithOrdinalSuffix } from "@/helpers/dateTimeHelper";
import React from "react";
import { useSelector } from "react-redux";

export default function Overview() {
    const { workspace } = useSelector((state) => state.workspace);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const owner = workspaceUsers.find((user) => user.id == workspace.user_id);
    return (
        <div className="p-12">
            <div className="flex items-center gap-x-8">
                <WorkspaceAvatar name={workspace.name} size="h-24 text-5xl" />
                <h3 className="text-4xl text-color-high-emphasis font-extrabold capitalize">
                    {workspace.name}
                </h3>
            </div>
            <hr className="my-6" />
            <div className="grid grid-cols-3 px-4">
                <h5 className=" font-bold text-color-high-emphasis">
                    Created by
                </h5>
                <a
                    href={"mailto:" + owner?.email}
                    className="text-color-medium-emphasis hover:underline"
                >
                    {owner?.display_name || owner?.name}
                </a>
            </div>
            <hr className="my-6" />
            <div className="grid grid-cols-3 px-4">
                <h5 className=" font-bold text-color-high-emphasis">
                    Date created
                </h5>
                <p className="text-color-medium-emphasis">
                    {formatDateWithOrdinalSuffix(
                        new Date(workspace.created_at)
                    )}
                </p>
            </div>
        </div>
    );
}
