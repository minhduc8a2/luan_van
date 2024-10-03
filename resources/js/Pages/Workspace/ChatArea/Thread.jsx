import {
    addThreadMessage,
    addThreadMessages,
    deleteThreadMessage,
    editThreadMessage,
    setThreadedMessage,
    setThreadedMessageId,
    setThreadMessages,
} from "@/Store/threadSlice";
import React, { useMemo } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import Message from "./Message/Message";
import { router, usePage } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import TipTapEditor from "@/Components/TipTapEditor";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";
import { compareDateTime, differenceInSeconds } from "@/helpers/dateTimeHelper";
import { getMentionsFromContent } from "@/helpers/tiptapHelper";
import { useInView } from "react-intersection-observer";
import { setMention } from "@/Store/mentionSlice";

import ForwardedMessage from "./Message/ForwardedMessage";
import { isHiddenUser } from "@/helpers/userHelper";
import {
    useChannel,
    useChannelData,
    useChannelUsers,
} from "@/helpers/customHooks";

import InfiniteScroll from "@/Components/InfiniteScroll";
import { findMinMaxId } from "@/helpers/channelHelper";
export default function Thread() {
    const dispatch = useDispatch();

    const { threadMessage: mentionThreadMessage } = useSelector(
        (state) => state.mention
    );
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const {
        message: threadedMessage,
        messageId: threadedMessageId,
        messages,
    } = useSelector((state) => state.thread);
    const channelId = threadedMessage?.channel_id;

    const { permissions } = useChannelData(channelId);

    const { channel } = useChannel(channelId);
    const { channelUsers } = useChannelUsers(channelId);

    const user = useMemo(() => {
        if (!threadedMessage) return null;
        return workspaceUsers.filter(
            (mem) => mem.id === threadedMessage.user_id
        )[0];
    }, [threadedMessage, workspaceUsers]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const [newMessageReactionReceive, setNewMessageReactionReceive] =
        useState(null);
    const threadConnectionRef = useRef(null);
    const [newMessageReceived, setNewMessageReceived] = useState(true);
    let preValue = null;
    let hasChanged = false;
    //Mention
    const [hasMention, setHasMention] = useState(false);
    const [mentionFulfilled, setMentionFulfilled] = useState(true);
    //Infinite scroll
    const [topLoading, setTopLoading] = useState(false);
    const [bottomLoading, setBottomLoading] = useState(false);
    const [topHasMore, setTopHasMore] = useState();
    const [bottomHasMore, setBottomHasMore] = useState();

    useEffect(() => {
        if (messages) {
            const { minId, maxId } = findMinMaxId(messages);
            console.log(minId, maxId);
            setTopHasMore(maxId);
            setBottomHasMore(minId);
        }
    }, [channel?.id, messages]);
    const loadMoreTopToken = useRef(null);
    const loadMoreBottomToken = useRef(null);
    const loadMore = (channelId, position, token, successCallBack) => {
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
                .get(route("messages.infiniteMessages", channelId), {
                    params: {
                        last_id,
                        direction: position,
                        threaded_message_id: threadedMessageId,
                    },
                    signal: token.signal,
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
                        if (response.data.length > 0) {
                            dispatch(
                                addThreadMessages({
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
        if (mentionThreadMessage) {
            setHasMention(mentionThreadMessage?.id);
            setMentionFulfilled(false);
            dispatch(setMention(null));
        }
    }, [mentionThreadMessage]);

    function onSubmit(content, fileObjects, JSONContent) {
        let mentionsList = getMentionsFromContent(JSONContent);
        if (
            content == "<p></p>" &&
            fileObjects.length == 0 &&
            mentionsList.length == 0
        )
            return;
        router.post(
            route("thread_message.store", {
                channel: channel.id,
                message: threadedMessageId,
            }),
            {
                content,
                fileObjects,
                mentionsList: getMentionsFromContent(JSONContent),
            },
            {
                onSuccess: () => {
                    setNewMessageReceived(true);
                },
                preserveState: true,
                preserveScroll: true,
                headers: {
                    "X-Socket-Id": Echo.socketId(),
                },
            }
        );
    }

    useEffect(() => {
        setNewMessageReceived(true);
        return () => {
            dispatch(setThreadMessages([]));
        };
    }, [threadedMessageId]);
    useEffect(() => {
        axios
            .get(route("messages.getMessage"), {
                params: {
                    messageId: threadedMessageId,
                },
            })
            .then((response) => {
                console.log(response);

                dispatch(setThreadedMessage(response.data));
            });
    }, [threadedMessageId]);
    useEffect(() => {
        threadConnectionRef.current = Echo.join(`threads.${threadedMessageId}`);
        threadConnectionRef.current
            .here((users) => {})
            .joining((user) => {
                // console.log("join thread", user);
            })
            .leaving((user) => {
                // console.log("leaving thread", user);
            })
            .listen("ThreadMessageEvent", (e) => {
                if (
                    e.type == "newMessageCreated" &&
                    !isHiddenUser(workspaceUsers, e.message?.user_id)
                )
                    dispatch(addThreadMessage(e.message));
                else if (
                    e.type == "messageEdited" &&
                    !isHiddenUser(workspaceUsers, e.message?.user_id)
                ) {
                    dispatch(editThreadMessage(e.message));
                } else if (
                    e.type == "messageDeleted" &&
                    !isHiddenUser(workspaceUsers, e.message?.user_id)
                ) {
                    dispatch(deleteThreadMessage(e.message.id));
                }
            })
            .listenForWhisper("messageReaction", (e) => {
                setNewMessageReactionReceive(e);
            })
            .error((error) => {
                console.error(error);
            });
    }, [threadedMessageId]);

    useEffect(() => {
        if (!threadedMessage || messages.length > 0) return;
        setLoadingMessages(true);
        // router.get(
        //     route("messages.threadMessages", threadedMessageId),
        //     mentionThreadMessage ? { message_id: mentionThreadMessage.id } : {}
        // );
        axios
            .get(
                route("messages.infiniteMessages", threadedMessage.channel_id),
                {
                    params: {
                        threaded_message_id: threadedMessageId,
                    },
                }
            )
            .then((response) => {
                dispatch(setThreadMessages(response.data || []));
                setLoadingMessages(false);
            });
        return () => {
            dispatch(setThreadMessages([]));
            Echo.leave(`threads.${threadedMessageId}`);
        };
    }, [threadedMessage, threadedMessageId]);

    // useEffect(() => {
    //     if (!mentionThreadMessage) return;
    //     setLoadingMessages(true);
    //     axios
    //         .get(
    //             route("messages.threadMessages", {
    //                 message: threadedMessageId,
    //             }),
    //             {
    //                 params: mentionThreadMessage
    //                     ? { message_id: mentionThreadMessage.id }
    //                     : {},
    //             }
    //         )
    //         .then((response) => {
    //             console.log(response);
    //             nextPageUrlRef.current = response.data?.messages?.next_page_url;
    //             previousPageUrlRef.current =
    //                 response.data?.messages?.prev_page_url;
    //             dispatch(
    //                 setThreadMessages(response.data?.messages?.data || [])
    //             );
    //             setLoadingMessages(false);
    //         });
    // }, [mentionThreadMessage]);

    const sortedMessages = useMemo(() => {
        const temp = [...messages];
        temp.sort((a, b) => compareDateTime(a.created_at, b.created_at));
        return temp;
    }, [messages]);

    //resize thread width
    useEffect(() => {
        if (mentionThreadMessage) {
            setHasMention(mentionThreadMessage.id);
            setMentionFulfilled(false);
            dispatch(setMention(null));
            if (newMessageReceived) setNewMessageReceived(false);
        }
    }, [mentionThreadMessage, newMessageReceived]);
    useEffect(() => {
        if (hasMention && sortedMessages && !mentionFulfilled) {
            const targetMessage = document.getElementById(
                `message-${hasMention}`
            );
            if (!targetMessage || topLoading || bottomLoading) {
            }
            if (targetMessage) {
                targetMessage.classList.add("bg-link/15");

                setTimeout(() => {
                    targetMessage.classList.remove("bg-link/15");
                }, 3000);
                targetMessage.scrollIntoView({
                    behavior: "instant",
                    block: "center",
                });
                setHasMention(null);
                setMentionFulfilled(true);
            }
        }
    }, [
        sortedMessages,
        hasMention,
        mentionFulfilled,
        topLoading,
        bottomLoading,
    ]);
    const thread_messages_count = threadedMessage?.thread_messages_count || 0;
    return (
        <>
            <div className="p-4 z-10">
                <div className="flex justify-between font-bold text-lg opacity-75 items-center">
                    <div className="">Thread</div>
                    <button
                        onClick={() => dispatch(setThreadedMessageId(null))}
                        className="hover:bg-white/15 rounded-lg p-2"
                    >
                        <IoClose className="text-xl" />
                    </button>
                </div>
            </div>

            <div className="max-h-[30%] overflow-y-auto scrollbar py-8">
                {threadedMessage && threadedMessage.forwarded_message ? (
                    <ForwardedMessage
                        threadStyle={true}
                        message={threadedMessage}
                        user={user}
                        hasChanged={true}
                        index={0}
                    />
                ) : (
                    threadedMessage && (
                        <Message
                            threadStyle={true}
                            message={threadedMessage}
                            user={user}
                            hasChanged={true}
                            index={0}
                        />
                    )
                )}
            </div>

            <div className="flex items-center gap-x-4 pl-4 my-4">
                <h3 className="text-sm text-white/75">
                    {thread_messages_count}{" "}
                    {thread_messages_count > 1 ? "replies" : "reply"}
                </h3>{" "}
                <hr className="border-white/15 flex-1" />
            </div>
            {loadingMessages && (
                <div className="flex justify-center items-center">
                    <div className="h-12 w-12 relative">
                        <OverlayLoadingSpinner spinerStyle="border-link" />
                    </div>
                    Loading messages ...
                </div>
            )}

            {!loadingMessages && messages && channel && channelUsers && (
                <InfiniteScroll
                    loadMoreOnTop={(successCallBack) =>
                        loadMore(
                            channelId,
                            "top",
                            loadMoreTopToken.current,
                            successCallBack
                        )
                    }
                    loadMoreOnBottom={(successCallBack) =>
                        loadMore(
                            channelId,
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
                    rootMargin="100px"
                    scrollToItem={hasMention}
                    className="overflow-y-auto max-w-full flex-1 scrollbar"
                >
                    {sortedMessages.map((msg, index) => {
                        const user = channelUsers.find(
                            (mem) => mem.id === msg.user_id
                        );

                        hasChanged = false;
                        if (preValue) {
                            if (
                                preValue.user.id != user.id ||
                                differenceInSeconds(
                                    preValue.msg.updated_at,
                                    msg.updated_at
                                ) > 10
                            ) {
                                hasChanged = true;
                                preValue = { user, msg };
                            }
                        } else preValue = { user, msg };
                        return (
                            <Message
                                key={msg.id}
                                message={msg}
                                user={user}
                                hasChanged={hasChanged}
                                index={index}
                                threadStyle={true}
                                messagableConnectionRef={threadConnectionRef}
                                newMessageReactionReceive={
                                    newMessageReactionReceive
                                }
                                resetNewMessageReactionReceive={() =>
                                    setNewMessageReactionReceive(null)
                                }
                            />
                        );
                    })}
                </InfiniteScroll>
            )}

            <div className="m-6 border border-white/15 pt-4 px-2 rounded-lg">
                {permissions.thread && threadedMessage && (
                    <TipTapEditor
                        onSubmit={onSubmit}
                        message={threadedMessage}
                        channel={channel}
                        channelUsers={channelUsers}
                    />
                )}
                {!permissions.thread && (
                    <h5 className="mb-4 text-center ml-4">
                        You're not allowed to post in thread. Contact Admins or
                        Channel managers for more information!
                    </h5>
                )}
            </div>
        </>
    );
}
