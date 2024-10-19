import useLoadWorkspaceUsers from "@/helpers/useLoadWorkspaceUsers";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import MemberRow from "./MemberRow";
import Button from "@/Components/Button";
import { InvitationForm } from "../../Panel/InvitationForm";
import FilterButton from "@/Components/FilterButton";
import SimpleSearchInput from "@/Components/Input/SimpleSearchInput";

export default function ManageMembers() {
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const loadWorkspaceUsers = useLoadWorkspaceUsers();
    const { workspace } = useSelector((state) => state.workspace);
    const [isInvitationFormOpen, setIsInvitationFormOpen] = useState(false);
    useEffect(() => {
        loadWorkspaceUsers();
    }, []);
    const sortList = [
        {
            inside: "A to Z",
            title: "A to Z",
            value: "a_to_z",
        },
        {
            inside: "Z to A",
            title: "Z to A",
            value: "z_to_a",
        },
    ];
    const accountTypeList = [
        {
            inside: "Any account type",
            title: "Any account type",
            value: "all",
        },
        {
            inside: "Admins",
            title: "Admins",
            value: "ADMIN",
        },
        {
            inside: "Regular members",
            title: "Regular members",
            value: "MEMBER",
        },
        {
            inside: "Guests",
            title: "Guests",
            value: "GUEST",
        },
    ];
    const [sortTypes, setSortTypes] = useState(sortList[0].value);
    const [searchValue, setSearchValue] = useState("");
    const [filter, setFilter] = useState({
        accountType: accountTypeList[0].value,
    });
    const filteredMembers = useMemo(() => {
        let temp = workspaceUsers.filter(
            (user) =>
                user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                user.email.toLowerCase().includes(searchValue.toLowerCase())
        );
        //owntype
        switch (filter.accountType) {
            case "all":
                break;
            case "ADMIN":
                temp = temp.filter((u) => u.workspaceRole.name == "ADMIN");

                break;
            case "MEMBER":
                temp = temp.filter((u) => u.workspaceRole.name == "MEMBER");

                break;
            case "GUEST":
                temp = temp.filter((u) => u.workspaceRole.name == "GUEST");
                break;
        }
        if (sortTypes == "a_to_z") {
            temp.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            temp.sort((a, b) => b.name.localeCompare(a.name));
        }
        return temp;
    });
    return (
        <div className="bg-color-contrast h-full pt-8">
            <InvitationForm
                workspace={workspace}
                isOpen={isInvitationFormOpen}
                onClose={() => setIsInvitationFormOpen(false)}
            />
            <div className="flex justify-between pr-8 items-center">
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
            <div className="flex justify-between px-8 mt-8 items-center">
                <div className="flex items-center gap-x-4">
                    <FilterButton
                        list={sortList}
                        action={(value) => setSortTypes(value)}
                    />
                    <FilterButton
                        list={accountTypeList}
                        action={(value) => {
                            setFilter((pre) => ({
                                ...pre,
                                accountType: value,
                            }));
                        }}
                    />
                </div>
                <SimpleSearchInput
                    width="w-96"
                    placeholder="Search by name or email..."
                    onChange={(e) => {
                        setSearchValue(e.target.value);
                    }}
                />
            </div>
            <div className="flex justify-between bg-background h-fit py-2 px-8 mt-4">
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
                        {filteredMembers.length == 0 && (
                            <p className="text-color-medium-emphasis text-center text-sm mt-4">
                                No members yet.
                            </p>
                        )}
                        {filteredMembers.map((user) => {
                            return <MemberRow user={user} key={user.id} />;
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}
