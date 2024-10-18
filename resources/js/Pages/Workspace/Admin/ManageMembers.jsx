import useLoadWorkspaceUsers from "@/helpers/useLoadWorkspaceUsers";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";

export default function ManageMembers() {
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const loadWorkspaceUsers = useLoadWorkspaceUsers();
    useEffect(() => {
        loadWorkspaceUsers();
    }, []);
    return (
        <div className="bg-color-contrast h-full pt-8">
            <h1 className="text-3xl font-bold text-color-high-emphasis px-8">
                Manage Members
            </h1>
            <div className="flex bg-background h-fit py-2 px-8 mt-8">
                <h5 className="text-color-medium-emphasis text-sm">
                    {workspaceUsers.length} members
                </h5>
            </div>
            <div className="px-8 ">
                <table className="w-full">
                    <thead className="text-color-medium-emphasis text-sm">
                        <tr className="flex gap-x-4 py-2">
                            <th className="flex-1 text-left border-r border-r-color/15">Full name</th>
                            <th className="w-48 text-left">Display name</th>
                            <th className="w-96 text-left">Email address</th>
                            <th className="w-48 text-left">Account type</th>
                            <th className="w-48 text-left">Date joined</th>
                        </tr>
                    </thead>
                </table>
            </div>
        </div>
    );
}
