import CustomedPopover from "@/Components/CustomedPopover";
import WorkspaceAvatar from "@/Components/WorkspaceAvatar";
import React from "react";
import { IoIosArrowDown } from "react-icons/io";

export default function WorkspaceOptions({ workspace }) {
    return (
        <CustomedPopover
            triggerNode={
                <div className="flex gap-x-1 items-center">
                    <h3 className="text-xl font-semibold">{workspace.name}</h3>
                    <IoIosArrowDown className="text-lg" />
                </div>
            }
            anchor="bottom start"
            className="mt-4"
        >
            <div className="mb-2">
                <div className="flex gap-x-2 items-center my-2 px-4 py-2 hover:bg-foreground">
                    <WorkspaceAvatar name={workspace.name} />
                    <h2 className="text-xl font-bold text-color-high-emphasis ">
                        {workspace.name}
                    </h2>
                </div>
                <hr />
                <div className="mb-2">
                    <h3 className="px-4 text-sm text-color-medium-emphasis my-2">
                        Settings
                    </h3>
                    <CustomedPopover.ListItem>
                        Edit workspace details
                    </CustomedPopover.ListItem>
                    <CustomedPopover.ListItem>
                        Workspace settings
                    </CustomedPopover.ListItem>
                </div>

                <hr />
                <div className="">
                    <h3 className="px-4 text-sm text-color-medium-emphasis my-2">
                        Adminstration
                    </h3>
                    <CustomedPopover.ListItem>
                        Manage members
                    </CustomedPopover.ListItem>
                </div>
            </div>
        </CustomedPopover>
    );
}
