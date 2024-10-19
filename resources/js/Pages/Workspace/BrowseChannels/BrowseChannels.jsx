import React, { useMemo, useRef, useState, useEffect } from "react";
import { CreateChannelForm } from "../Panel/CreateChannelForm";
import Button from "@/Components/Button";
import { usePage } from "@inertiajs/react";
import Filter from "./Filter";
import { FaCheck } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import SearchInput from "../../../Components/Input/SearchInput";
import { loadRegularChannels } from "@/helpers/channelHelper";
import InfiniteScroll from "@/Components/InfiniteScroll";
import LoadingSpinner from "@/Components/LoadingSpinner";

import useGoToChannel from "@/helpers/useGoToChannel";
import useLeaveChannel from "@/helpers/useLeaveChannel";
import useIsChannelMember from "@/helpers/useIsChannelMember";

import useJoinChannel from "@/helpers/useJoinChannel";
export default function BrowseChannels() {
    const { auth } = usePage().props;
    const { workspace } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();
    const [allChannels, setAllChannels] = useState([]);

    const [searchValue, setSearchValue] = useState("");
    const [filterLoading, setFilterLoading] = useState(false);
    const [topLoading, setTopLoading] = useState(false);
    const [bottomLoading, setBottomLoading] = useState(false);
    const [topHasMore, setTopHasMore] = useState();
    const [bottomHasMore, setBottomHasMore] = useState();

    const goToChannel = useGoToChannel();
    const leaveChannelInHook = useLeaveChannel(workspace.id);
    const joinChannelInHook = useJoinChannel();
    useEffect(() => {
        Echo.private(`private_workspaces.${workspace.id}`).listen(
            "WorkspaceEvent",
            (e) => {
                switch (e.type) {
                    case "ChannelObserver_deleteChannel":
                        setAllChannels((pre) => {
                            let temp = [...pre];

                            temp = temp.filter((f) => f.id != e.data);
                            if (temp.length > 0) {
                                setTopHasMore(temp[0].id);
                                setBottomHasMore(temp[temp.length - 1].id);
                            }
                            return temp;
                        });
                        break;

                    case "ChannelObserver_storeChannel":
                        loadRegularChannels(e.data.workspace_id, e.data.id)
                            .then((response) => {
                                const newChannel = response.data;

                                setAllChannels((pre) => {
                                    const temp = [newChannel, ...pre];
                                    if (temp.length > 0) {
                                        setTopHasMore(temp[0].id);
                                        setBottomHasMore(
                                            temp[temp.length - 1].id
                                        );
                                    }
                                    return temp;
                                });
                            })
                            .catch((errors) => {
                                console.log(errors);
                            });

                        break;
                    default:
                        break;
                }
            }
        );
    }, []);
    function mutateFiles(pre, data, position) {
        if (position == "top") {
            return [...data, ...pre];
        } else {
            return [...pre, ...data];
        }
    }
    const [filter, setFilter] = useState({
        ownType: "all_channels",
        privacyType: "any_channel_type",
        sort: "newest_channel",
    });

    const filteredChannels = useMemo(() => {
        let tempChannels = [...allChannels];
        //owntype
        switch (filter.ownType) {
            case "all_channels":
                break;
            case "my_channels":
                tempChannels = tempChannels.filter(
                    (cn) => cn.user_id == auth.user.id
                );

                break;
            case "other_channels":
                tempChannels = tempChannels.filter(
                    (cn) => cn.user_id != auth.user.id
                );
                break;
        }
        //privacy type
        switch (filter.privacyType) {
            case "any_channel_type":
                break;
            case "public":
                tempChannels = tempChannels.filter((cn) => cn.type == "PUBLIC");
                break;
            case "private":
                tempChannels = tempChannels.filter(
                    (cn) => cn.type == "PRIVATE"
                );
                break;
            case "archived":
                tempChannels = tempChannels.filter((cn) => cn.is_archived);
                break;
        }
        switch (filter.sort) {
            case "a_to_z":
                tempChannels.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "z_to_a":
                tempChannels.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case "newest_channel":
                tempChannels.sort((a, b) => b.id - a.id);
                break;
            case "oldest_channel":
                tempChannels.sort((a, b) => a.id - b.id);
                break;
            case "most_members":
                tempChannels.sort((a, b) => b.users_count - a.users_count);
                break;
            case "fewest_members":
                tempChannels.sort((a, b) => a.users_count - b.users_count);
                break;
        }
        return tempChannels;
    }, [filter, allChannels, searchValue]);
    function changeChannel(channel) {
        goToChannel(workspace.id, channel.id);
    }
    function joinChannel(channel, options) {
        options.onBefore();
        joinChannelInHook(channel.id).then(() => {
            options.onSuccess();
            search(searchValue);
        });
    }
    function leaveChannel(channel, options) {
        options.onBefore();
        leaveChannelInHook(channel.id, channel.type, false).then((response) => {
            options.onSuccess();
            search(searchValue);
        });
    }

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
                .get(route("channels.browseChannels", workspace.id), {
                    params: {
                        ownType: filter.ownType,
                        privacyType: filter.privacyType,
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
                            setAllChannels((pre) =>
                                mutateFiles(pre, response.data, "top")
                            );
                        } else {
                            if (response.data.length > 0) {
                                setBottomHasMore(
                                    response.data[response.data.length - 1].id
                                );
                            } else {
                                setBottomHasMore(null);
                            }
                            setAllChannels((pre) =>
                                mutateFiles(pre, response.data, "bottom")
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
            .get(route("channels.browseChannels", workspace.id), {
                params: {
                    ownType: filter.ownType,
                    privacyType: filter.privacyType,
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
                    setAllChannels(mutateFiles([], response.data, "bottom"));
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
        <div className="bg-foreground w-full h-full border border-color/15 ">
            <div className="mx-auto w-1/2 py-4 flex flex-col max-h-full">
                <div className="flex justify-between items-center">
                    <div className="flex gap-x-4 items-center">
                        <h3 className="text-xl font-bold text-color-high-emphasis">
                            All Channels
                        </h3>
                        {filterLoading && (
                            <div className="flex gap-x-2 items-center  ">
                                <div className="h-6 w-6 relative">
                                    <LoadingSpinner />
                                </div>
                                <div className="text-xs text-color-medium-emphasis">Loading ...</div>
                            </div>
                        )}
                    </div>
                    <CreateChannelForm
                        callback={() => search(searchValue)}
                        activateButtonNode={
                            <Button className=" font-bold border border-color/15 !bg-background">
                                Create Channel
                            </Button>
                        }
                    />
                </div>
                <SearchInput
                    placeholder="Search for channels"
                    onSearch={(searchValue) => search(searchValue)}
                    list={allChannels}
                    onItemClick={changeChannel}
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
                                className="flex p-2 px-4 items-baseline gap-x-2 w-full"
                            >
                                {item.type == "PUBLIC" ? (
                                    <span className="text-xl">#</span>
                                ) : (
                                    <FaLock className="text-sm inline" />
                                )}{" "}
                                {item.name}
                            </button>
                        );
                    }}
                />
                <Filter
                    setFilter={(a) => {
                        setFilter(a);
                    }}
                    changeChannel={changeChannel}
                />
                <InfiniteScroll
                    loadMoreOnTop={() => loadMore("top")}
                    loadMoreOnBottom={() => loadMore("bottom")}
                    topHasMore={topHasMore}
                    bottomHasMore={bottomHasMore}
                    topLoading={topLoading}
                    bottomLoading={bottomLoading}
                    className="mt-4 bg-background flex-1 max-h-full overflow-y-auto scrollbar rounded-lg border border-color/15"
                >
                    {filteredChannels.length == 0 && (
                        <p className="text-center p-4 text-color-medium-emphasis">No results found</p>
                    )}
                    {filteredChannels.map((cn, index) => {
                        return (
                            <li
                                className="border-t first:border-none border-t-white/15"
                                key={cn.id}
                            >
                                <ChannelItem
                                    channel={cn}
                                    changeChannel={changeChannel}
                                    joinChannel={joinChannel}
                                    leaveChannel={leaveChannel}
                                />
                            </li>
                        );
                    })}
                </InfiniteScroll>
            </div>
        </div>
    );
}

function ChannelItem({ channel, changeChannel, joinChannel, leaveChannel }) {
    const [joinProcessing, setJoinProcessing] = useState(false);
    const [leaveProcessing, setLeaveProcessing] = useState(false);
    const isChannelMember = useIsChannelMember(channel.id);

    return (
        <div className="p-4 relative group/browse_channel_item">
            <div className="flex items-baseline gap-x-1 text-color-high-emphasis">
                {channel.type == "PUBLIC" ? (
                    <span className="text-xl">#</span>
                ) : (
                    <FaLock className="text-sm inline" />
                )}{" "}
                {channel.name}
            </div>
            <ul className="flex items-center gap-x-[2px] mt-1 text-color-medium-emphasis">
                {isChannelMember && (
                    <>
                        <li className="flex gap-x-1 items-center text-xs text-green-800 font-semibold">
                            {" "}
                            <FaCheck className="text-[8px]" />
                            Joined
                        </li>
                        <li>
                            <LuDot className="text-sm" />
                        </li>
                    </>
                )}

                <li className="text-xs">
                    {channel.users_count}{" "}
                    {channel.users_count > 1 ? "members" : "member"}
                </li>
                {channel.description && (
                    <>
                        <li>
                            <LuDot className="text-sm" />
                        </li>

                        <li className="text-xs ">{channel.description}</li>
                    </>
                )}
            </ul>
            <div className="hidden gap-x-4 group-hover/browse_channel_item:flex absolute top-1/2 right-2 -translate-y-1/2 ">
                <Button
                    className="!bg-background hover:!bg-foreground border border-color/15"
                    onClick={() => {
                        changeChannel(channel);
                    }}
                >
                    Open in Home
                </Button>
                {isChannelMember ? (
                    !channel.is_main_channel && (
                        <Button
                            loading={leaveProcessing}
                            className="!bg-background hover:!bg-foreground border border-color/15"
                            onClick={() =>
                                leaveChannel(channel, {
                                    onBefore: () => {
                                        setLeaveProcessing(true);
                                    },
                                    onSuccess: () => {
                                        setLeaveProcessing(false);
                                    },
                                })
                            }
                        >
                            Leave
                        </Button>
                    )
                ) : (
                    <Button
                        loading={joinProcessing}
                        className="!bg-background hover:!bg-foreground border border-color/15"
                        onClick={() =>
                            joinChannel(channel, {
                                onBefore: () => {
                                    setJoinProcessing(true);
                                },
                                onSuccess: () => {
                                    setJoinProcessing(false);
                                },
                            })
                        }
                    >
                        Join
                    </Button>
                )}
            </div>
        </div>
    );
}
