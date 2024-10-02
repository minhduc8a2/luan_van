import React, { useContext, useMemo } from "react";

import TipTapEditor from "@/Components/TipTapEditor";
import { router, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";

import {
    compareDateTime,
    differenceInSeconds,
    formatDDMMYYY,
    groupListByDate,
} from "@/helpers/dateTimeHelper";

import Message from "./Message/Message";

import { useSelector, useDispatch } from "react-redux";
import { EditDescriptionForm } from "./EditDescriptionForm";
import axios from "axios";

import { getMentionsFromContent } from "@/helpers/tiptapHelper";
import { findMinMaxId, getChannelName } from "@/helpers/channelHelper";

import { setMention } from "@/Store/mentionSlice";
import ChannelSettings from "./ChannelSettings/ChannelSettings";

import { FaLock } from "react-icons/fa";
import Button from "@/Components/Button";
import ForwardedMessage from "./Message/ForwardedMessage";
import { isHiddenUser } from "@/helpers/userHelper";
import Layout from "../Layout";
import Header from "./Header";
import { resetMessageCountForChannel } from "@/Store/channelsSlice";
import InitData from "./InitData";
import {
    useChannel,
    useChannelData,
    useChannelUsers,
} from "@/helpers/customHooks";
import InfiniteScroll from "@/Components/InfiniteScroll";
import { addMessages, setChannelData } from "@/Store/channelsDataSlice";

function ChatArea() {
    const { auth, channelId } = usePage().props;
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);

    const { permissions, messages } = useChannelData(channelId);

    const { channelUsers } = useChannelUsers(channelId);

    const { channel } = useChannel(channelId);

    const messageContainerRef = useRef(null);

    const { messageId: threadMessageId } = useSelector((state) => state.thread);
    const { messageId, threadMessage: mentionThreadMessage } = useSelector(
        (state) => state.mention
    );

    const [focus, setFocus] = useState(1);
    const dispatch = useDispatch();

    const [loaded, setLoaded] = useState(false);

    const [newMessageReceived, setNewMessageReceived] = useState(true);

    const [newMessageReactionReceive, setNewMessageReactionReceive] =
        useState(null);
    const channelConnectionRef = useRef(null);

    //infinite scrolling
    const [topLoading, setTopLoading] = useState(false);
    const [bottomLoading, setBottomLoading] = useState(false);
    const [topHasMore, setTopHasMore] = useState();
    const [bottomHasMore, setBottomHasMore] = useState();

    useEffect(() => {
        if (loaded) {
            const { minId, maxId } = findMinMaxId(messages);
            console.log(minId, maxId);
            setTopHasMore(maxId);
            setBottomHasMore(minId);
        }
    }, [channel?.id, loaded]);

    const loadMore = (position, successCallBack) => {
        // return new Promise((resolve, reject) => {});
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
                .get(route("messages.infiniteMessages", channel.id), {
                    params: {
                        last_id,
                        direction: position,
                    },
                    // signal: token.current.signal,
                })
                .then((response) => {
                    if (response.status == 200) {
                        console.log(position, response.data);
                        if (position == "top") {
                            if (response.data.length > 0) {
                                setTopHasMore(response.data[0].id);
                            } else {
                                setTopHasMore(null);
                            }
                        } else {
                            if (response.data.length > 0) {
                                setBottomHasMore(
                                    response.data[response.data.length - 1].id
                                );
                            } else {
                                setBottomHasMore(null);
                            }
                        }
                        dispatch(
                            addMessages({
                                id: channelId,
                                data: response.data,
                                position,
                            })
                        );
                        successCallBack();
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
    };

    useEffect(() => {
        Echo.private(`private_channels.${channelId}`).listen(
            "MessageEvent",
            (e) => {
                console.log("messageEvent", e);

                switch (e.type) {
                    case "newMessageCreated":
                        setNewMessageReceived(true);
                }
            }
        );
    }, [channelId]);
    function joinChannel() {
        router.post(
            route("channel.join", channel.id),
            {},
            {
                preserveState: true,
                only: [
                    "channels",

                    "channel",
                    "permissions",
                    "channelPermissions",
                    "channelUsers",
                ],
                headers: {
                    "X-Socket-Id": Echo.socketId(),
                },
            }
        );
    }
    function onSubmit(content, fileObjects, JSONContent) {
        let mentionsList = getMentionsFromContent(JSONContent);
        if (
            content == "<p></p>" &&
            fileObjects.length == 0 &&
            mentionsList.length == 0
        )
            return;
        router.post(
            route("message.store", { channel: channel.id }),
            {
                content,
                fileObjects,
                mentionsList,
            },
            {
                only: [],
                preserveState: true,
                preserveScroll: true,
                headers: {
                    "X-Socket-Id": Echo.socketId(),
                },
                onFinish: () => {
                    setFocus((pre) => pre + 1);
                },
            }
        );
    }

    let preValue = null;
    let hasChanged = false;

    //
    // //reset state on channel changes

    useEffect(() => {
        if (!channel) return;

        dispatch(resetMessageCountForChannel(channel));
        // axios.post(route("channel.last_read", channel.id), {});
        return () => {
            setNewMessageReceived(true);
            axios.post(route("channel.last_read", channel.id), {});
        };
    }, [channel?.id]);

    const groupedMessages = useMemo(() => {
        if (!messages) return [];
        const gMessages = groupListByDate(messages);
        const currentDate = formatDDMMYYY(new Date());
        return Object.keys(gMessages)
            .sort((a, b) => {
                return compareDateTime(a, b);
            })
            .map((key) => {
                const formatedDate = formatDDMMYYY(new Date(key));
                // gMessages[key].sort((a, b) => a.id - b.id);
                return {
                    date: formatedDate == currentDate ? "Today" : formatedDate,
                    mgs: gMessages[key],
                };
            });
    }, [messages]);
    useEffect(() => {
        if (!channel?.id) return;

        channelConnectionRef.current = Echo.join(`channels.${channel.id}`);
        channelConnectionRef.current
            .here((users) => {})

            .listen("ThreadMessageEvent", (e) => {
                if (
                    e.type == "newMessageCreated" &&
                    !isHiddenUser(workspaceUsers, e.message?.user_id)
                )
                    dispatch(addThreadMessagesCount(e.threadedMessageId));
                else if (
                    e.type == "messageDeleted" &&
                    !isHiddenUser(workspaceUsers, e.message?.user_id)
                )
                    dispatch(subtractThreadMessagesCount(e.threadedMessageId));
                // console.log(e);
            })

            .listenForWhisper("messageReaction", (e) => {
                setNewMessageReactionReceive(e);
            })
            .error((error) => {
                console.error(error);
            });

        return () => {
            channelConnectionRef.current = null;
            Echo.leave(`channels.${channel.id}`);
        };
    }, [channel?.id, threadMessageId]);

    const channelName = useMemo(() => {
        if (!channel) return "";
        return getChannelName(channel, workspaceUsers, auth.user);
    }, [channel]);
    const welcomeMessage = useMemo(() => {
        if (!channel) return "";
        const welcomeMessages = [
            `📣You’re looking at the #${channelName} channel`,
            `👋 Welcome to the #${channelName} channel`,
            `🥳 You’ve found the #${channelName} channel`,
        ];
        if (channelName.includes("all-")) return welcomeMessages[0];
        if (channelName.includes("social")) return welcomeMessages[2];
        return welcomeMessages[1];
    }, [channel?.id]);



   
    const isChannelMember = useMemo(() => {
        if (!channel) return false;
        return channelUsers.some((u) => u.id === auth.user.id);
    }, [channelUsers]);
    return (
        <div className="flex-1 flex min-h-0 max-h-full w-full">
            <InitData loaded={loaded} setLoaded={(value) => setLoaded(value)} />
            {loaded && channel && (
                <div className="bg-background  chat-area-container flex-1 ">
                    <Header
                        channel={channel}
                        channelName={channelName}
                        channelUsers={channelUsers}
                    />
                    <InfiniteScroll
                        loadMoreOnTop={(successCallBack) =>
                            loadMore("top", successCallBack)
                        }
                        loadMoreOnBottom={(successCallBack) =>
                            loadMore("bottom", successCallBack)
                        }
                        topHasMore={topHasMore}
                        bottomHasMore={bottomHasMore}
                        topLoading={topLoading}
                        bottomLoading={bottomLoading}
                        triggerScrollBottom={newMessageReceived}
                        clearTriggerScrollBottom={() =>
                            setNewMessageReceived(false)
                        }
                        reverse
                        scrollToItem={null}
                        rootMargin="500px"
                        className="overflow-y-auto max-w-full scrollbar"
                    >
                        <div className="p-8">
                            <h1 className="text-3xl font-extrabold text-white/85">
                                {" "}
                                {welcomeMessage}
                            </h1>

                            <div className="text-white/85 mt-2">
                                {channel?.description}{" "}
                                <div className="inline-block">
                                    <EditDescriptionForm />
                                </div>
                            </div>
                        </div>
                        {groupedMessages.map(({ date, mgs }, pIndex) => {
                            return (
                                <div className="relative pb-4" key={date}>
                                    <div className="border-t border-white/15 translate-y-3"></div>
                                    <div className="text-xs border border-white/15 rounded-full h-6 flex items-center px-4 sticky top-0 left-1/2 -translate-x-1/2  w-fit bg-background z-20">
                                        {date}
                                    </div>

                                    <ul className="">
                                        {mgs.map((message, index) => {
                                            let user = {
                                                ...workspaceUsers.find(
                                                    (mem) =>
                                                        mem.id ===
                                                        message.user_id
                                                ),
                                            };
                                            if (
                                                user &&
                                                !channelUsers.find(
                                                    (u) => u.id == user.id
                                                )
                                            ) {
                                                user.notMember = true;
                                            }
                                            if (!user)
                                                user = {
                                                    id: message.user_id,
                                                    name: message.user_name,
                                                    notMember: true,
                                                };
                                            // if (!user) return "";
                                            hasChanged = false;
                                            if (preValue) {
                                                if (
                                                    preValue.user.id !=
                                                        user.id ||
                                                    differenceInSeconds(
                                                        preValue.message
                                                            .created_at,
                                                        message.created_at
                                                    ) > 10
                                                ) {
                                                    hasChanged = true;
                                                    preValue = {
                                                        user,
                                                        message,
                                                    };
                                                }
                                            } else
                                                preValue = {
                                                    user,
                                                    message,
                                                };
                                            if (message.forwarded_message) {
                                                return (
                                                    <ForwardedMessage
                                                        key={message.id}
                                                        message={message}
                                                        user={user}
                                                        hasChanged={hasChanged}
                                                        index={index}
                                                        messagableConnectionRef={
                                                            channelConnectionRef
                                                        }
                                                        newMessageReactionReceive={
                                                            newMessageReactionReceive
                                                        }
                                                        resetNewMessageReactionReceive={() =>
                                                            setNewMessageReactionReceive(
                                                                null
                                                            )
                                                        }
                                                    />
                                                );
                                            }
                                            return (
                                                <Message
                                                    key={message.id}
                                                    message={message}
                                                    user={user}
                                                    hasChanged={hasChanged}
                                                    index={index}
                                                    messagableConnectionRef={
                                                        channelConnectionRef
                                                    }
                                                    newMessageReactionReceive={
                                                        newMessageReactionReceive
                                                    }
                                                    resetNewMessageReactionReceive={() =>
                                                        setNewMessageReactionReceive(
                                                            null
                                                        )
                                                    }
                                                />
                                            );
                                        })}
                                    </ul>
                                </div>
                            );
                        })}
                    </InfiniteScroll>

                    <div className="m-6 border border-white/15 pt-4 px-2 rounded-lg ">
                        {permissions.chat && (
                            <TipTapEditor onSubmit={onSubmit} />
                        )}
                        {!permissions.chat &&
                            !channel?.is_archived &&
                            isChannelMember && (
                                <h5 className="mb-4 text-center ml-4">
                                    You're not allowed to post in channel.
                                    Contact Admins or Channel managers for more
                                    information!
                                </h5>
                            )}
                        {!isChannelMember && permissions.join && (
                            <div className="">
                                <div className="flex items-baseline gap-x-1 font-bold justify-center text-lg">
                                    {channel.type == "PUBLIC" ? (
                                        <span className="text-xl">#</span>
                                    ) : (
                                        <FaLock className="text-sm inline" />
                                    )}{" "}
                                    {channelName}
                                </div>
                                <div className="flex gap-x-4 justify-center my-4 ">
                                    <ChannelSettings
                                        channelName={channelName}
                                        buttonNode={
                                            <Button className="bg-black/15 border border-white/15">
                                                Detail
                                            </Button>
                                        }
                                    />
                                    <Button
                                        className="bg-green-900"
                                        onClick={joinChannel}
                                    >
                                        Join Channel
                                    </Button>
                                </div>
                            </div>
                        )}
                        {channel?.is_archived == true && (
                            <div className="mb-4 justify-center flex ml-4 items-baseline gap-x-1 text-white/75">
                                You are viewing{" "}
                                <div className="flex items-baseline gap-x-1">
                                    {channel.type == "PUBLIC" ? (
                                        <span className="text-xl">#</span>
                                    ) : (
                                        <FaLock className="text-sm inline" />
                                    )}{" "}
                                    {channelName}
                                </div>
                                , an archived channel
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
ChatArea.layout = (page) => <Layout children={page} />;

export default ChatArea;
