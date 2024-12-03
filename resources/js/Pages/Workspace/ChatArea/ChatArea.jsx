import React, { createContext, useCallback, useContext, useMemo } from "react";
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
import { findMinMaxId, getChannelName } from "@/helpers/channelHelper";
import ForwardedMessage from "./Message/ForwardedMessage";
import { isHiddenUser } from "@/helpers/userHelper";

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
import LoadingSpinner from "@/Components/LoadingSpinner";
import MessagePlaceHolder from "./Message/MessagePlaceHolder";
import ChannelEventsEnum from "@/services/Enums/ChannelEventsEnum";

export const ChatAreaContext = createContext({ scrollBottom: null });
export default function ChatArea() {
    const { auth } = usePage().props;
    const { channelId, workspaceId } = useParams();
    const containerRef = useRef(null);
    // console.log(channelId);
    const [newMessageReceived, setNewMessageReceived] = useState(false);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const { permissions, messagesMap } = useChannelData(channelId);
    const messages = useMemo(
        () => Object.values(messagesMap || {}),
        [messagesMap]
    );
    const { channelUsers } = useChannelUsers(channelId);

    const { channel } = useChannel(channelId);
    // console.log(channel);
   
    const { messageId, threadMessage: mentionThreadMessage } = useSelector(
        (state) => state.mention
    );

    const dispatch = useDispatch();
    const [loaded, setLoaded] = useState(false);

   
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
    const [initedTopAndBottom, setInitedTopAndBottom] = useState(false);
    const scrollBottom = useCallback(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop =
                containerRef.current.scrollHeight -
                containerRef.current.clientHeight;
        }
    }, []);
    //auto scroll bottom when just showed channel
    useEffect(() => {
        if (!messageId && loaded) {
            scrollBottom();
        }
    }, [channelId, loaded]);

    //show new message
    useEffect(() => {
        if (newMessageReceived) {
            scrollBottom();
            setNewMessageReceived(false);
        }
    }, [newMessageReceived]);

    useEffect(() => {
        if (channelId) {
            Echo.private(`private_channels.${channelId}`)
                .listen("MessageEvent", (e) => {
                    switch (e.type) {
                        case ChannelEventsEnum.NEW_MESSAGE_CREATED:
                            //check user is bottom, if true, scroll bottom next render
                            if (
                                containerRef.current.scrollTop ==
                                containerRef.current.scrollHeight -
                                    containerRef.current.clientHeight
                            ) {
                                setNewMessageReceived(true);
                            }
                    }
                })
                .listen("ThreadMessageEvent", (e) => {
                    if (
                        e.type == ChannelEventsEnum.NEW_MESSAGE_CREATED &&
                        !isHiddenUser(workspaceUsers, e.message?.user_id)
                    )
                        dispatch(
                            addThreadMessagesCount({
                                id: channelId,
                                data: { message_id: e.threadedMessageId },
                            })
                        );
                    else if (
                        e.type == ChannelEventsEnum.MESSAGE_DELETED &&
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

                .error((error) => {
                    console.error(error);
                });
        }
    }, [channelId]);

    //init Top and bottom once, no need to inifinte load when messages changes!
    useEffect(() => {
        setInitedTopAndBottom(false);
    }, [channelId]);

    //init top and bottom load when first show channel
    useEffect(() => {
        if (
            messages &&
            !temporaryMessageSending &&
            !initedTopAndBottom &&
            loaded
        ) {
            const { minId, maxId } = findMinMaxId(messages);
            console.log(minId, maxId);
            setTopHasMore(maxId);
            setBottomHasMore(minId);
            setInitedTopAndBottom(true);
        }
    }, [channelId, loaded, messages, initedTopAndBottom]);

    //handle reconnect when offline
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

    //infinite load
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
                .get(
                    route("messages.infiniteMessages", {
                        workspace: workspaceId,
                        channel: channel.id,
                    }),
                    {
                        params: {
                            last_id,
                            direction: position,
                        },
                        signal: token.signal,
                    }
                )
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

    let preValue = null;
    let hasChanged = false;

    //
    // //reset state on channel changes

    useEffect(() => {
        if (!channel) return;

        dispatch(resetMessageCountForChannel(channel)); // reset new message count show in pannel channel to 0
        //fallback to set last time read of user on channel
        axios.post(
            route("channel.last_read", {
                workspace: workspaceId,
                channel: channelId,
            }),
            {}
        );
        return () => {
            //set last time read of user on channel
            axios.post(
                route("channel.last_read", {
                    workspace: workspaceId,
                    channel: channelId,
                }),
                {}
            );
        };
    }, [channelId, messages]);

    //want to jump to a message
    useEffect(() => {
        if (messageId && !mentionThreadMessage) {
            setHasMention(messageId);
            setMentionFulfilled(false);
            dispatch(setMention(null));
        }
    }, [messageId]);

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
    }, [channel]);

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
        <ChatAreaContext.Provider value={{ scrollBottom }}>
            <div className="flex-1 flex min-h-0 max-h-full w-full relative">
                {!loaded && <LoadingSpinner />}
                <InitData
                    loaded={loaded}
                    setLoaded={(value) => setLoaded(value)}
                />

                <div className="bg-background  chat-area-container flex-1 ">
                    <Header
                        channel={channel}
                        channelName={channelName}
                        channelUsers={channelUsers}
                        loaded={loaded}
                    />
                    {loaded && channel && (
                        <InfiniteScroll
                            threshold={0.01}
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
                            reverse
                            scrollToItem={hasMention}
                            className="overflow-y-auto max-w-full scrollbar"
                            ref={containerRef}
                        >
                            {!bottomHasMore && (
                                <div className="p-8">
                                    <h1 className="text-3xl font-extrabold text-color/85">
                                        {" "}
                                        {welcomeMessage}
                                    </h1>

                                    <div className="text-color/85 mt-2">
                                        {channel?.description}{" "}
                                        {permissions.updateDescription && (
                                            <div className="inline-block">
                                                <EditDescriptionForm />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {bottomHasMore && (
                                <div className="my-4 flex flex-col gap-y-4">
                                    <MessagePlaceHolder />
                                    <MessagePlaceHolder />
                                </div>
                            )}
                            {groupedMessages.map(({ date, mgs }, pIndex) => {
                                return (
                                    <div className="relative pb-4" key={date}>
                                        <div className="border-t border-color/15 translate-y-3"></div>
                                        <div className="text-xs text-color-medium-emphasis font-bold border border-color/15 rounded-full h-6 flex items-center px-4 sticky top-0 left-1/2 -translate-x-1/2  w-fit bg-background z-20">
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
                                                            hasChanged={
                                                                hasChanged
                                                            }
                                                            index={index}
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
                            setTemporaryMessageSending={
                                setTemporaryMessageSending
                            }
                        />
                    )}
                </div>
            </div>
        </ChatAreaContext.Provider>
    );
}
