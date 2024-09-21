import React, { useMemo, useState } from "react";
import { CreateChannelForm } from "../Panel/CreateChannelForm";
import Button from "@/Components/Button";
import { router, usePage } from "@inertiajs/react";
import Filter from "./Filter";
import { FaCheck } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
import { compareDateTime } from "@/helpers/dateTimeHelper";
import { useDispatch } from "react-redux";
import { setThreadMessage } from "@/Store/threadSlice";
import { setPageName } from "@/Store/pageSlice";
import SearchInput from "../../../Components/Input/SearchInput";
export default function BrowseChannels() {
    const { availableChannels, channels, auth } = usePage().props;
    const dispatch = useDispatch();
    const allChannels = useMemo(() => {
        const result = [...availableChannels];
        channels.forEach((cn) => {
            if (!result.find((c) => c.id == cn.id)) result.push(cn);
        });
        return result;
    }, [availableChannels, channels]);

    const [filter, setFilter] = useState({
        ownType: "all_channels",
        privacyType: "any_channel_type",
        sort: "a_to_z",
    });

    const filteredChannels = useMemo(() => {
        let tempChannels = [];
        //owntype
        switch (filter.ownType) {
            case "all_channels":
                tempChannels = [...allChannels];
                break;
            case "my_channels":
                tempChannels = [
                    ...allChannels.filter((cn) => cn.user_id == auth.user.id),
                ];
                break;
            case "other_channels":
                tempChannels = [
                    ...allChannels.filter((cn) => cn.user_id != auth.user.id),
                ];
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
        //sort
        switch (filter.sort) {
            case "a_to_z":
                tempChannels.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "z_to_a":
                tempChannels.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case "newest_channel":
                tempChannels.sort((a, b) =>
                    compareDateTime(b.created_at, a.created_at)
                );
                break;
            case "oldest_channel":
                tempChannels.sort((a, b) =>
                    compareDateTime(a.created_at, b.created_at)
                );
                break;
            case "most_members":
                tempChannels.sort((a, b) => b.users_count - a.users_count);
                break;
            case "fewest_members":
                tempChannels.sort((a, b) => a.users_count - b.users_count);
                break;
        }
        return tempChannels;
    }, [filter, allChannels]);
    function changeChannel(channel) {
        dispatch(setThreadMessage(null));

        router.get(
            route("channel.show", channel.id),
            {},
            {
                preserveState: true,
                onSuccess: () => dispatch(setPageName("normal")),
            }
        );
    }
    function joinChannel(channel, options) {
        router.post(
            route("channel.join", channel.id),
            {},
            {
                preserveState: true,
                only: ["channels", "availableChannels"],
                headers: {
                    "X-Socket-Id": Echo.socketId(),
                },
                ...options,
            }
        );
    }
    function leaveChannel(channel, options) {
        router.post(
            route("channel.leave", channel.id),
            {},
            {
                preserveState: true,
                only: ["channels", "availableChannels"],
                headers: {
                    "X-Socket-Id": Echo.socketId(),
                },
                ...options,
            }
        );
    }
    return (
        <div className="bg-foreground w-full h-full border border-white/15 ">
            <div className="mx-auto w-1/2 py-4 flex flex-col max-h-full">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">
                        All Channels
                    </h3>
                    <CreateChannelForm
                        activateButtonNode={
                            <Button className="text-white/100 font-bold border border-white/15 !bg-background">
                                Create Channel
                            </Button>
                        }
                    />
                </div>
                <SearchInput
                    list={allChannels}
                    onItemClick={changeChannel}
                    filterFunction={(searchValue, list) => {
                        return list.filter((cn) =>
                            cn.name.toLowerCase().includes(searchValue)
                        );
                    }}
                    renderItemNode={(item) => {
                        return (
                            <button
                                onClick={() => {
                                    console.log(item);
                                    changeChannel(item);
                                }}
                                className="flex items-baseline gap-x-2 w-full"
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
                    setFilter={(a) => setFilter(a)}
                    changeChannel={changeChannel}
                />
                {filteredChannels.length > 0 && (
                    <ul className="mt-4 bg-background flex-1 max-h-full overflow-y-auto scrollbar rounded-lg border border-white/15">
                        {filteredChannels.map((cn) => {
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
                    </ul>
                )}
            </div>
        </div>
    );
}

function ChannelItem({ channel, changeChannel, joinChannel, leaveChannel }) {
    const { channels } = usePage().props;
    const [joinProcessing, setJoinProcessing] = useState(false);
    const [leaveProcessing, setLeaveProcessing] = useState(false);
    const isChannelMember = useMemo(
        () => channels.find((cn) => cn.id === channel.id),
        [channels, channel]
    );

    return (
        <div className="p-4 relative group/browse_channel_item">
            <div className="flex items-baseline gap-x-1">
                {channel.type == "PUBLIC" ? (
                    <span className="text-xl">#</span>
                ) : (
                    <FaLock className="text-sm inline" />
                )}{" "}
                {channel.name}
            </div>
            <ul className="flex items-center gap-x-[2px] mt-1">
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
                    className="!bg-background hover:!bg-foreground border border-white/15"
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
                            className="!bg-background hover:!bg-foreground border border-white/15"
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
                        className="!bg-background hover:!bg-foreground border border-white/15"
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
