import useLoadWorkspaceUsers from "@/helpers/useLoadWorkspaceUsers";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import MemberRow from "./MemberRow";
import Button from "@/Components/Button";
import { InvitationForm } from "../../Panel/InvitationForm";

export default function ManageMembers() {
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const loadWorkspaceUsers = useLoadWorkspaceUsers();
    const { workspace } = useSelector((state) => state.workspace);
    const [isInvitationFormOpen, setIsInvitationFormOpen] = useState(false);
    useEffect(() => {
        loadWorkspaceUsers();
    }, []);
    return (
        <div className="bg-color-contrast h-full pt-8">
            <InvitationForm
                workspace={workspace}
                isOpen={isInvitationFormOpen}
                onClose={() => setIsInvitationFormOpen(false)}
            />
            <div className="flex justify-between pr-8">
                <h1 className="text-3xl font-bold text-color-high-emphasis px-8">
                    Manage Members
                </h1>
                <Button
                    type="green"
                    onClick={() => setIsInvitationFormOpen(true)}
                >
                    Invite People
                </Button>
            </div>
            <div className="flex bg-background h-fit py-2 px-8 mt-8">
                <h5 className="text-color-medium-emphasis text-sm">
                    {workspaceUsers.length} members
                </h5>
            </div>
            <div className="px-8 ">
                <div className="overflow-x-auto min-w-full ">
                    <div className="text-color-medium-emphasis/85 text-sm  flex min-w-fit gap-x-4 border-b border-b-color/15 ">
                        <div className="min-w-96  text-left border-r border-r-color/15 py-2 px-2">
                            Full name
                        </div>
                        <div className="min-w-48 text-left py-2">
                            Display name
                        </div>
                        <div className="min-w-48 text-left py-2">
                            Email address
                        </div>
                        <div className="min-w-48 text-left py-2">
                            Account type
                        </div>
                        <div className="min-w-48 text-left py-2">Status</div>
                        <div className="min-w-48 text-left py-2">
                            Date joined
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
