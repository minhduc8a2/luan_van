import CustomedPopover from "@/Components/CustomedPopover";
import WorkspaceAvatar from "@/Components/WorkspaceAvatar";
import React from "react";
import { IoIosArrowDown } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function WorkspaceOptions({ workspace }) {
    const { workspacePermissions } = useSelector((state) => state.workspace);
    return (
        <CustomedPopover
            triggerNode={
                <div className="flex gap-x-1 items-center hover:bg-color/10 cursor-pointer p-2 rounded-lg">
                    <h3 className="text-xl font-semibold capitalize">
                        {workspace.name}
                    </h3>
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
                {workspacePermissions.update && (
                    <>
                        <hr />
                        <div className="mb-2">
                            <h3 className="px-4 text-sm text-color-medium-emphasis my-2">
                                Settings
                            </h3>
                            <CustomedPopover.ListItem>
                                Edit workspace details
                            </CustomedPopover.ListItem>
                            <CustomedPopover.ListItem>
                                <Link
                                    to={`/workspaces/${workspace.id}/admin/settings`}
                                    className="w-full h-full block"
                                >
                                    Workspace settings
                                </Link>
                            </CustomedPopover.ListItem>
                        </div>

                        <hr />
                        <div className="">
                            <h3 className="px-4 text-sm text-color-medium-emphasis my-2">
                                Adminstration
                            </h3>
                            <CustomedPopover.ListItem>
                                <Link
                                    to={`/workspaces/${workspace.id}/admin/manage_members`}
                                    className="w-full h-full block"
                                >
                                    Manage members
                                </Link>
                            </CustomedPopover.ListItem>
                        </div>
                    </>
                )}

                <hr className="my-2" />
                <CustomedPopover.ListItem>
                    <Link
                        to={`/workspaces/${workspace.id}/admin/about_workspace`}
                        className="w-full h-full block"
                    >
                        About this workspace
                    </Link>
                </CustomedPopover.ListItem>
            </div>
        </CustomedPopover>
    );
}
