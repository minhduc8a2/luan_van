import useLoadWorkspaceUsers from "@/helpers/useLoadWorkspaceUsers";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import MemberRow from "./MemberRow";

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
                <div className="w-full ">
                    <div className="text-color-medium-emphasis/85 text-sm">
                        <div className="flex gap-x-4 border-b border-b-color/15">
                            <div className="flex-1 text-left border-r border-r-color/15 py-2 px-2">
                                Full name
                            </div>
                            <div className="w-48 text-left py-2">
                                Display name
                            </div>
                            <div className="w-96 text-left py-2">
                                Email address
                            </div>
                            <div className="w-48 text-left py-2">
                                Account type
                            </div>
                            <div className="w-48 text-left py-2">
                                Status
                            </div>
                            <div className="w-48 text-left py-2">
                                Date joined
                            </div>
                        </div>
                    </div>
                    <ul className="flex flex-col ">
                        {workspaceUsers.map((user) => {
                            return <MemberRow user={user} key={user.id} />;
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}
