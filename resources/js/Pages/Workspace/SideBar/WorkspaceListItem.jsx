import React from "react";

import { MdWorkspacesOutline } from "react-icons/md";
export default function WorkspaceListItem({ workspace, current = false }) {
    return (
        <div className="flex gap-x-2 p-4 items-center hover:bg-white/10 text-color-high-emphasis">
            <MdWorkspacesOutline />
            <div className="">
                {workspace.name}{" "}
                <span className="text-sm opacity-50">
                    {current ? " (current)" : ""}
                </span>
            </div>
        </div>
    );
}
