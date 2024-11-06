import React, { useMemo, useRef, useState, useEffect } from "react";
import { CreateChannelForm } from "../Panel/CreateChannelForm";
import Button from "@/Components/Button";
import { router, usePage } from "@inertiajs/react";

import { useDispatch, useSelector } from "react-redux";
import SearchInput from "../../../Components/Input/SearchInput";
import Layout from "../Layout";
import InfiniteScroll from "@/Components/InfiniteScroll";
import LoadingSpinner from "@/Components/LoadingSpinner";
import FilterButton from "@/Components/FilterButton";
import UserItem from "./UserItem";
import { setProfile } from "@/Store/profileSlice";
import { InvitationForm } from "../Panel/InvitationForm";
export default function BrowseUsers() {
    // const [allUsers, setAllUsers] = useState([]);
    const { workspace } = useSelector((state) => state.workspace);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const [searchValue, setSearchValue] = useState("");
    const [filterLoading, setFilterLoading] = useState(false);
    const dispatch = useDispatch();
    const [isInvitationFormOpen, setIsInvitationFormOpen] = useState(false);
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
       
    ];
    useEffect(() => {
        // Echo.private(`private_workspaces.${workspace.id}`).listen(
        //     "WorkspaceEvent",
        //     (e) => {
        //         switch (e.type) {
        //             case "ChannelObserver_deleteChannel":
        //                 setAllUsers((pre) => {
        //                     let temp = [...pre];
        //                     temp = temp.filter((f) => f.id != e.data);
        //                     if (temp.length > 0) {
        //                         setTopHasMore(temp[0].id);
        //                         setBottomHasMore(temp[temp.length - 1].id);
        //                     }
        //                     return temp;
        //                 });
        //                 break;
        //             case "ChannelObserver_storeChannel":
        //                 setAllUsers((pre) => {
        //                     const sorted = [...e.data.files];
        //                     sorted.sort((a, b) => b.id - a.id);
        //                     const temp = [...sorted, ...pre];
        //                     if (temp.length > 0) {
        //                         setTopHasMore(temp[0].id);
        //                         setBottomHasMore(temp[temp.length - 1].id);
        //                     }
        //                     return temp;
        //                 });
        //                 break;
        //             default:
        //                 break;
        //         }
        //     }
        // );
    }, []);
    // function mutateUsers(pre, data, position) {
    //     if (position == "top") {
    //         return [...data, ...pre];
    //     } else {
    //         return [...pre, ...data];
    //     }
    // }
    const [filter, setFilter] = useState({
        accountType: "all",
        sort: "a_to_z",
    });

    const filteredUsers = useMemo(() => {
        let tempUsers = [...workspaceUsers];
        //owntype
        switch (filter.accountType) {
            case "all":
                break;
            case "ADMIN":
                tempUsers = tempUsers.filter(
                    (u) => u.workspaceRole.name == "ADMIN"
                );

                break;
            case "MEMBER":
                tempUsers = tempUsers.filter(
                    (u) => u.workspaceRole.name == "MEMBER"
                );

                break;
            
        }

        switch (filter.sort) {
            case "a_to_z":
                tempUsers.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "z_to_a":
                tempUsers.sort((a, b) => b.name.localeCompare(a.name));
                break;
        }
        return tempUsers.filter((u) =>
            u.name.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [filter, workspaceUsers, searchValue]);

    return (
        <div className="bg-foreground w-full h-full border border-color/15 ">
            <div className="mx-auto w-1/2 py-4 flex flex-col max-h-full">
                <div className="flex justify-between items-center">
                    <div className="flex gap-x-4 items-center">
                        <h3 className="text-xl font-bold text-color-high-emphasis">
                            All people
                        </h3>
                        {filterLoading && (
                            <div className="flex gap-x-2 items-center  ">
                                <div className="h-6 w-6 relative">
                                    <LoadingSpinner />
                                </div>
                                <div className="text-xs">Loading ...</div>
                            </div>
                        )}
                    </div>
                    <InvitationForm
                        isOpen={isInvitationFormOpen}
                        workspace={workspace}
                        onClose={() => setIsInvitationFormOpen(false)}
                    />
                    <Button
                        className=" font-bold border border-color/15 !bg-background"
                        onClick={() => setIsInvitationFormOpen(true)}
                    >
                        Invite people
                    </Button>
                </div>
                <SearchInput
                    placeholder="Search for users"
                    onSearch={(searchValue) => setSearchValue(searchValue)}
                    list={filteredUsers}
                    // onItemClick={changeChannel}
                    filterFunction={(searchValue, list) => {
                        return list.filter((u) =>
                            u.name.toLowerCase().includes(searchValue)
                        );
                    }}
                    onChange={() => {
                        if (searchValue) setSearchValue("");
                    }}
                    renderItemNode={(item, closePanel, clearInput) => {
                        // console.log(item);
                        return (
                            <button
                                onClick={() => {
                                    dispatch(setProfile(item.id));
                                    closePanel();
                                    clearInput();
                                }}
                                className="w-full h-full p-4 text-left text-color-high-emphasis"
                            >
                                {item.displayName || item.name}
                            </button>
                        );
                    }}
                />
                <div className="flex justify-between mt-6">
                    <FilterButton
                        list={accountTypeList}
                        action={(value) => {
                            setFilter((pre) => ({
                                ...pre,
                                accountType: value,
                            }));
                        }}
                    />
                    <FilterButton
                        list={sortList}
                        action={(value) => {
                            setFilter((pre) => ({
                                ...pre,
                                sort: value,
                            }));
                        }}
                    />
                </div>
                <ul className="mt-6 flex flex-row gap-y-4 flex-wrap max-h-full overflow-y-auto scrollbar rounded-lg ">
                    {filteredUsers.length == 0 && (
                        <p className="text-center p-4">No results found</p>
                    )}

                    {filteredUsers.map((u, index) => {
                        return (
                            <li className="mr-4" key={u.id}>
                                <UserItem user={u} />
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
