import React, { useMemo, useRef, useState, useEffect } from "react";
import { CreateChannelForm } from "../Panel/CreateChannelForm";
import Button from "@/Components/Button";
import { router, usePage } from "@inertiajs/react";

import { useDispatch } from "react-redux";
import SearchInput from "../../../Components/Input/SearchInput";
import Layout from "../Layout";
import InfiniteScroll from "@/Components/InfiniteScroll";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";
import FilterButton from "@/Components/FilterButton";
import UserItem from "./UserItem";
function BrowseUsers() {
    const { auth, workspace } = usePage().props;
    const dispatch = useDispatch();
    const [allUsers, setAllUsers] = useState([]);

    const [searchValue, setSearchValue] = useState("");
    const [filterLoading, setFilterLoading] = useState(false);
    const [topLoading, setTopLoading] = useState(false);
    const [bottomLoading, setBottomLoading] = useState(false);
    const [topHasMore, setTopHasMore] = useState();
    const [bottomHasMore, setBottomHasMore] = useState();
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
            value: "admin",
        },
        {
            inside: "Regular members",
            title: "Regular members",
            value: "member",
        },
        {
            inside: "Guests",
            title: "Guests",
            value: "guest",
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
    function mutateUsers(pre, data, position) {
        if (position == "top") {
            return [...data, ...pre];
        } else {
            return [...pre, ...data];
        }
    }
    const [filter, setFilter] = useState({
        accountType: "all",
        sort: "a_to_z",
    });

    const filteredUsers = useMemo(() => {
        let tempUsers = [...allUsers];
        //owntype
        switch (filter.accountType) {
            case "all":
                break;
            case "admins":
                // tempUsers = tempUsers.filter(
                //     (cn) => cn.user_id == auth.user.id
                // );

                break;
            case "member":
            case "guest":
                // tempUsers = tempUsers.filter(
                //     (cn) => cn.user_id != auth.user.id
                // );
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
        return tempUsers;
    }, [filter, allUsers, searchValue]);

    function loadMore(position) {
        let last_id;
        if (position == "top") {
            last_id = topHasMore;
        } else {
            last_id = bottomHasMore;
        }
        if (last_id) {
            if (position == "top") {
                setTopLoading(true);
            } else {
                setBottomLoading(true);
            }

            return axios
                .get(route("users.browseUsers", workspace.id), {
                    params: {
                        accountType: filter.accountType,

                        name: searchValue,
                        last_id,
                        direction: position,
                    },
                    // signal: token.current.signal,
                })
                .then((response) => {
                    if (response.status == 200) {
                        if (position == "top") {
                            if (response.data.length > 0) {
                                setTopHasMore(response.data[0].id);
                            } else {
                                setTopHasMore(null);
                            }
                            setAllUsers((pre) =>
                                mutateUsers(pre, response.data, "top")
                            );
                        } else {
                            if (response.data.length > 0) {
                                setBottomHasMore(
                                    response.data[response.data.length - 1].id
                                );
                            } else {
                                setBottomHasMore(null);
                            }
                            setAllUsers((pre) =>
                                mutateUsers(pre, response.data, "bottom")
                            );
                        }
                    }
                })
                .finally(() => {
                    if (position == "top") {
                        setTopLoading(false);
                    } else {
                        setBottomLoading(false);
                    }
                });
        }
    }

    const token = useRef(null);

    function search(searchValue) {
        if (token.current != null) token.current.abort();

        token.current = new AbortController();
        return axios
            .get(route("users.browseUsers", workspace.id), {
                params: {
                    accountType: filter.ownType,

                    name: searchValue,
                    last_id: "",
                    direction: "bottom",
                },
                signal: token.current.signal,
            })
            .then((response) => {
                if (response.status == 200) {
                    console.log(response.data);
                    if (response.data.length > 0) {
                        setTopHasMore(response.data[0].id);
                        setBottomHasMore(
                            response.data[response.data.length - 1].id
                        );
                    } else {
                        setTopHasMore(null);
                        setBottomHasMore(null);
                    }
                    setAllUsers(mutateUsers([], response.data, "bottom"));
                }
            })
            .finally(() => {
                setTopLoading(false);
                setBottomLoading(false);
            });
    }

    useEffect(() => {
        setFilterLoading(true);
        search("").then(() => {
            setFilterLoading(false);
        });
    }, [filter.ownType, filter.privacyType]);
    return (
        <div className="bg-foreground w-full h-full border border-white/15 ">
            <div className="mx-auto w-1/2 py-4 flex flex-col max-h-full">
                <div className="flex justify-between items-center">
                    <div className="flex gap-x-4 items-center">
                        <h3 className="text-xl font-bold text-white">
                            All Channels
                        </h3>
                        {filterLoading && (
                            <div className="flex gap-x-2 items-center  ">
                                <div className="h-6 w-6 relative">
                                    <OverlayLoadingSpinner />
                                </div>
                                <div className="text-xs">Loading ...</div>
                            </div>
                        )}
                    </div>
                    <CreateChannelForm
                        callback={() => search(searchValue)}
                        activateButtonNode={
                            <Button className="text-white/100 font-bold border border-white/15 !bg-background">
                                Create Channel
                            </Button>
                        }
                    />
                </div>
                <SearchInput
                    placeholder="Search for channels"
                    onSearch={(searchValue) => search(searchValue)}
                    list={allUsers}
                    // onItemClick={changeChannel}
                    filterFunction={(searchValue, list) => {
                        return list.filter((cn) =>
                            cn.name.toLowerCase().includes(searchValue)
                        );
                    }}
                    onChange={(e) => {
                        setSearchValue(e.target.value);
                        if (!e.target.value) {
                            search("");
                        }
                    }}
                    renderItemNode={(item) => {
                        return (
                            <button
                                onClick={() => {
                                    changeChannel(item);
                                }}
                                className=""
                            >
                                {item.displayName || item.name}
                            </button>
                        );
                    }}
                />
                <div className="flex justify-between mt-6">
                    <FilterButton list={accountTypeList} action={() => {}} />
                    <FilterButton list={sortList} action={() => {}} />
                </div>
                <InfiniteScroll
                    loadMoreOnTop={() => loadMore("top")}
                    loadMoreOnBottom={() => loadMore("bottom")}
                    topHasMore={topHasMore}
                    bottomHasMore={bottomHasMore}
                    topLoading={topLoading}
                    bottomLoading={bottomLoading}
                    className="mt-6 flex flex-row flex-wrap max-h-full overflow-y-auto scrollbar rounded-lg "
                >
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
                </InfiniteScroll>
            </div>
        </div>
    );
}

BrowseUsers.layout = (page) => <Layout children={page} />;

export default BrowseUsers;
