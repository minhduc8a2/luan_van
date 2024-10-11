import React, { useMemo } from "react";
import { usePage } from "@inertiajs/react";
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
import { findMinMaxId, getChannelName } from "@/helpers/channelHelper";
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
import {
    addMessages,
    addThreadMessagesCount,
    subtractThreadMessagesCount,
} from "@/Store/channelsDataSlice";
import Editor from "./Editor";
import { useParams } from "react-router-dom";
import { setMention } from "@/Store/mentionSlice";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";
import MessagePlaceHolder from "./Message/MessagePlaceHolder";
export default function ChatArea() {
    const { auth } = usePage().props;
    const { channelId } = useParams();
    // console.log(channelId);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const { permissions, messages } = useChannelData(channelId);
    const { channelUsers } = useChannelUsers(channelId);

    const { channel } = useChannel(channelId);
    // console.log(channel);
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
    //Mention
    const [hasMention, setHasMention] = useState(false);
    const [mentionFulfilled, setMentionFulfilled] = useState(true);
    //infinite scrolling
    const [topLoading, setTopLoading] = useState(false);
    const [bottomLoading, setBottomLoading] = useState(false);
    const [topHasMore, setTopHasMore] = useState();
    const [bottomHasMore, setBottomHasMore] = useState();
    const [temporaryMessageSending, setTemporaryMessageSending] =
        useState(false);
    useEffect(() => {
        if (messages && !temporaryMessageSending) {
            const { minId, maxId } = findMinMaxId(messages);
            // console.log(minId, maxId);
            setTopHasMore(maxId);
            setBottomHasMore(minId);
        }
    }, [channel?.id, messages]);

    useEffect(() => {
        function handleReconnect() {
            console.log("reconnected");
            const { minId, maxId } = findMinMaxId(messages);
            // console.log(minId, maxId);
            setTopHasMore(maxId);
            setBottomHasMore(minId);
        }
        Echo.connector.pusher.connection.bind("connected", handleReconnect);
        return () => {
            Echo.connector.pusher.connection.unbind(
                "connected",
                handleReconnect
            );
        };
    }, [messages]);

    const loadMoreTopToken = useRef(null);
    const loadMoreBottomToken = useRef(null);

    const loadMore = (position, token, successCallBack) => {
        if (token != null) token.abort();
        token = new AbortController();
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
                    signal: token.signal,
                })
                .then((response) => {
                    if (response.status == 200) {
                        // console.log(position, response.data);
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
                        if (response.data.length > 0) {
                            dispatch(
                                addMessages({
                                    id: channelId,
                                    data: response.data,
                                    position,
                                })
                            );
                        }
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

    let preValue = null;
    let hasChanged = false;

    //
    // //reset state on channel changes

    useEffect(() => {
        if (!channel) return;
        if (!messageId) setNewMessageReceived(true);
        dispatch(resetMessageCountForChannel(channel));
        axios.post(route("channel.last_read", channelId), {});
        return () => {
            axios.post(route("channel.last_read", channelId), {});
        };
    }, [channelId]);
    useEffect(() => {
        if (messageId && !mentionThreadMessage) {
            setHasMention(messageId);
            setMentionFulfilled(false);
            dispatch(setMention(null));

            if (newMessageReceived) setNewMessageReceived(false);
        }
    }, [messageId, newMessageReceived]);
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
                    dispatch(
                        addThreadMessagesCount({
                            id: channelId,
                            data: { message_id: e.threadedMessageId },
                        })
                    );
                else if (
                    e.type == "messageDeleted" &&
                    !isHiddenUser(workspaceUsers, e.message?.user_id)
                )
                    dispatch(
                        subtractThreadMessagesCount({
                            id: channelId,
                            data: { message_id: e.threadedMessageId },
                        })
                    );
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

    useEffect(() => {
        if (hasMention && groupedMessages && !mentionFulfilled) {
            console.log("hasMention", hasMention);
            const targetMessage = document.getElementById(
                `message-${hasMention}`
            );
            if (!targetMessage || topLoading || bottomLoading) return;
            if (targetMessage) {
                targetMessage.classList.add("bg-link/15");

                setTimeout(() => {
                    targetMessage.classList.remove("bg-link/15");
                    try {
                        setHasMention(null);
                        setMentionFulfilled(true);
                    } catch (error) {
                        console.error("Failed to update mention state:", error);
                    }
                }, 3000);
                targetMessage.scrollIntoView({
                    behavior: "instant",
                    block: "center",
                });
            }
        }
    }, [
        groupedMessages,
        hasMention,
        mentionFulfilled,
        topLoading,
        bottomLoading,
    ]);

    return (
        <div className="flex-1 flex min-h-0 max-h-full w-full relative">
            {!loaded && <OverlayLoadingSpinner />}
            <InitData loaded={loaded} setLoaded={(value) => setLoaded(value)} />

            <div className="bg-background  chat-area-container flex-1 ">
                <Header
                    channel={channel}
                    channelName={channelName}
                    channelUsers={channelUsers}
                    loaded={loaded}
                    topLoading={topLoading}
                    bottomLoading={bottomLoading}
                />
                {loaded && channel && (
                    <InfiniteScroll
                        threshold={0.5}
                        rootMargin="0px"
                        loadMoreOnTop={(successCallBack) =>
                            loadMore(
                                "top",
                                loadMoreTopToken.current,
                                successCallBack
                            )
                        }
                        loadMoreOnBottom={(successCallBack) =>
                            loadMore(
                                "bottom",
                                loadMoreBottomToken.current,
                                successCallBack
                            )
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
                        scrollToItem={hasMention}
                        className="overflow-y-auto max-w-full scrollbar"
                    >
                       {!bottomHasMore&& <div className="p-8">
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
                        </div>}
                        {bottomHasMore && (
                            <div className="my-4 flex flex-col gap-y-4">
                                <MessagePlaceHolder />
                                <MessagePlaceHolder />
                            </div>
                        )}
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
                )}
                {loaded && channel && (
                    <Editor
                        channel={channel}
                        permissions={permissions}
                        isChannelMember={isChannelMember}
                        channelName={channelName}
                        setFocus={setFocus}
                        setTemporaryMessageSending={setTemporaryMessageSending}
                        setNewMessageReceived={setNewMessageReceived}
                    />
                )}
            </div>
        </div>
    );
}
