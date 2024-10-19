import AvatarAndName from "@/Components/AvatarAndName";
import FilterButton from "@/Components/FilterButton";
import SimpleSearchInput from "@/Components/Input/SimpleSearchInput";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";

export default function AdminsAndOwners() {
    const { workspace } = useSelector((state) => state.workspace);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
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
    const [sortTypes, setSortTypes] = useState(sortList[0].value);
    const [searchValue, setSearchValue] = useState("");
    const adminsAndOwners = useMemo(() => {
        const temp = workspaceUsers.filter(
            (user) =>
                user.workspaceRole.name == "ADMIN" &&
                user.name.toLowerCase().includes(searchValue.toLowerCase())
        );
        if (sortTypes == "a_to_z") {
            temp.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            temp.sort((a, b) => b.name.localeCompare(a.name));
        }
        return temp;
    });
    return (
        <div className="p-8">
            <div className="flex justify-between">
                <FilterButton
                    list={sortList}
                    action={(value) => setSortTypes(value)}
                />
                <SimpleSearchInput
                    width="w-96"
                    placeholder="Search admins and owners"
                    onChange={(e) => {
                        setSearchValue(e.target.value);
                    }}
                />
            </div>
            <ul className="mt-4">
                {adminsAndOwners.map((user) => {
                    return (
                        <li
                            key={user.id}
                            className="flex justify-between items-center border-b border-b-color/15 py-4 px-2"
                        >
                            <AvatarAndName
                                user={user}
                                className="h-10 w-10"
                                gap="gap-x-4"
                                noStatus
                                description={
                                    <p className="text-color-medium-emphasis  font-light">
                                        {user?.email}
                                    </p>
                                }
                            />
                            <p className="text-color-medium-emphasis">
                                {user.id != workspace.user_id
                                    ? "Admin"
                                    : "Owner"}
                            </p>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
