import {
    addThreadMessage,
    addThreadMessages,
    deleteThreadMessage,
    editThreadMessage,
    setThreadedMessage,
    setThreadedMessageId,
    setThreadMessages,
    updateThreadMessageAfterSendFailed,
    updateThreadMessageAfterSendSuccessfully,
} from "@/Store/threadSlice";
import React, { useCallback, useMemo } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import Message from "./Message/Message";
import { router, usePage } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import TipTapEditor from "@/Components/TipTapEditor";
import LoadingSpinner from "@/Components/LoadingSpinner";
import { compareDateTime, differenceInSeconds } from "@/helpers/dateTimeHelper";
import { getMentionsFromContent } from "@/helpers/tiptapHelper";
import { setMention } from "@/Store/mentionSlice";

import ForwardedMessage from "./Message/ForwardedMessage";
import { isHiddenUser } from "@/helpers/userHelper";
import {
    useChannel,
    useChannelData,
    useChannelUsers,
} from "@/helpers/customHooks";
import { v4 as uuidv4 } from "uuid";
import InfiniteScroll from "@/Components/InfiniteScroll";
import { findMinMaxId } from "@/helpers/channelHelper";
import {
    addThreadMessagesCount,
    subtractThreadMessagesCount,
} from "@/Store/channelsDataSlice";
import { useParams } from "react-router-dom";
import MessagePlaceHolder from "./Message/MessagePlaceHolder";
import ChannelEventsEnum from "@/services/Enums/ChannelEventsEnum";
export default function Thread() {
    const { auth } = usePage().props;
    const dispatch = useDispatch();
    const { threadMessage: mentionThreadMessage } = useSelector(
        (state) => state.mention
    );
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const containerRef = useRef(null);
    const {
        message: threadedMessage,
        messageId: threadedMessageId,
        messages,
    } = useSelector((state) => state.thread);
    const channelId = threadedMessage?.channel_id;
    const { workspaceId } = useParams();
    const { permissions } = useChannelData(channelId);
    const publicAppUrl = import.meta.env.VITE_PUBLIC_APP_URL
    const { channel } = useChannel(channelId);
    const { channelUsers } = useChannelUsers(channelId);

    const user = useMemo(() => {
        if (!threadedMessage || !workspaceUsers) return null;

        const foundUser = workspaceUsers.find(
            (mem) => mem.id == threadedMessage.user_id
        );
        return foundUser || null;
    }, [threadedMessage, workspaceUsers]);

    const [loadingMessages, setLoadingMessages] = useState(false);

    const threadConnectionRef = useRef(null);

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
    const [temporaryMessageSending, setTemporaryMessageSending] =
        useState(false);
    const [initedTopAndBottom, setInitedTopAndBottom] = useState(false);
    useEffect(() => {
        setInitedTopAndBottom(false);
    }, [channelId]);

    const scrollBottom = useCallback(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop =
                containerRef.current.scrollHeight -
                containerRef.current.clientHeight;
        }
    }, []);
    //auto scroll bottom when just showed channel
    useEffect(() => {
        if (!mentionThreadMessage && !loadingMessages) {
            scrollBottom();
        }
    }, [threadedMessageId, loadingMessages]);
    useEffect(() => {
        if (
            messages &&
            !temporaryMessageSending &&
            !initedTopAndBottom &&
            messages.length > 0
        ) {
            console.log(messages);
            const { minId, maxId } = findMinMaxId(messages);
            // console.log(minId, maxId);
            setTopHasMore(maxId);
            setBottomHasMore(minId);
            setInitedTopAndBottom(true);
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
                .get(
                    route("messages.infiniteMessages", {
                        workspace: workspaceId,
                        channel: channelId,
                    }),
                    {
                        params: {
                            last_id,
                            direction: position,
                            threaded_message_id: threadedMessageId,
                        },
                        signal: token.signal,
                    }
                )
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

        //create new message on client side
        const tempFiles = fileObjects.map((fileObject, index) => {
            return {
                id: index,
                name: fileObject.name,
                url:
                    publicAppUrl +
                    "/" +
                    fileObject.path.replace("public", "storage"),
                type: fileObject.type,
                path: fileObject.path,
                workspace_id: workspaceId,
                user_id: auth.user.id,
                created_at: new Date().toUTCString(),
            };
        });
        const newMessageId = uuidv4();
        const newMessage = {
            id: newMessageId,
            isTemporary: true,
            threaded_message_id: threadedMessageId,
            content,
            reactions: [],
            thread_messages_count: 0,
            files: tempFiles,
            user_id: auth.user.id,
            channel_id: channelId,
            isSending: true,
            created_at: new Date().toUTCString(),
        };
        setTemporaryMessageSending(true);
        dispatch(addThreadMessage(newMessage));
        dispatch(
            addThreadMessagesCount({
                id: channelId,
                data: { message_id: threadedMessageId },
            })
        );

        setTimeout(() => {
            setTemporaryMessageSending(false);
        }, 0);
        axios
            .post(
                route("thread_message.store", {
                    workspace: workspaceId,
                    channel: channel.id,
                    message: threadedMessageId,
                }),
                {
                    created_at: newMessage.created_at,
                    content,
                    fileObjects,
                    mentionsList: getMentionsFromContent(JSONContent),
                },
                {
                    headers: {
                        "X-Socket-Id": Echo.socketId(),
                    },
                }
            )
            .then((response) => {
                console.log("Success");
                dispatch(
                    updateThreadMessageAfterSendSuccessfully({
                        temporaryId: newMessageId,
                        data: response.data.message,
                    })
                );
            })
            .catch((error) => {
                console.error(error);
                dispatch(
                    updateThreadMessageAfterSendFailed({
                        temporaryId: newMessageId,
                    })
                );
                dispatch(
                    subtractThreadMessagesCount({
                        id: channelId,
                        data: { message_id: threadedMessageId },
                    })
                );
            });
    }

    useEffect(() => {
        return () => {
            dispatch(setThreadMessages([]));
        };
    }, [threadedMessageId]);
    useEffect(() => {
        if (!threadedMessageId) return;

        if (threadedMessage && threadedMessage.id == threadedMessageId) return;
        axios
            .get(
                route("messages.getMessage", {
                    workspace: workspaceId,
                }),
                {
                    params: {
                        messageId: threadedMessageId,
                    },
                }
            )
            .then((response) => {
                console.log("", response);

                dispatch(setThreadedMessage(response.data));
            });
    }, [threadedMessageId]);
    useEffect(() => {
        if (!threadedMessageId) return;
        threadConnectionRef.current = Echo.join(`threads.${threadedMessageId}`);
        threadConnectionRef.current
            .listen("ThreadMessageEvent", (e) => {
                console.log(e);
                switch (e.type) {
                    case ChannelEventsEnum.NEW_MESSAGE_CREATED:
                        if (!isHiddenUser(workspaceUsers, e.message?.user_id))
                            dispatch(addThreadMessage(e.message));

                        break;
                    case ChannelEventsEnum.MESSAGE_EDITED:
                        if (!isHiddenUser(workspaceUsers, e.message?.user_id)) {
                            dispatch(
                                editThreadMessage({
                                    message_id: e.message.id,
                                    content: e.message.content,
                                })
                            );
                        }
                        break;

                    case ChannelEventsEnum.MESSAGE_DELETED:
                        if (!isHiddenUser(workspaceUsers, e.message?.user_id)) {
                            dispatch(deleteThreadMessage(e.message.id));
                        }
                        break;
                }
            })

            .error((error) => {
                console.error(error);
            });
        return () => {
            Echo.leave(`threads.${threadedMessageId}`);
        };
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
                route("messages.infiniteMessages", {
                    workspace: workspaceId,
                    channel: threadedMessage.channel_id,
                }),
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
        temp.sort((a, b) => a.id - b.id);
        return temp;
    }, [messages]);

    //resize thread width
    useEffect(() => {
        if (mentionThreadMessage) {
            setHasMention(mentionThreadMessage.id);
            setMentionFulfilled(false);
            dispatch(setMention(null));
        }
    }, [mentionThreadMessage]);
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
                    <div className="text-color-high-emphasis">Thread</div>
                    <button
                        onClick={() => dispatch(setThreadedMessageId(null))}
                        className="hover:bg-color/15 rounded-lg p-2"
                    >
                        <IoClose className="text-xl text-color-medium-emphasis" />
                    </button>
                </div>
            </div>
            {!threadedMessage && (
                <div className="h-full w-full">
                    <LoadingSpinner />
                </div>
            )}
            {threadedMessage && (
                <>
                    <div className="max-h-[30%] overflow-y-auto scrollbar py-8">
                        {threadedMessage &&
                        threadedMessage.forwarded_message ? (
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
                        <h3 className="text-sm text-color/75">
                            {thread_messages_count}{" "}
                            {thread_messages_count > 1 ? "replies" : "reply"}
                        </h3>{" "}
                        <hr className="border-color/15 flex-1" />
                    </div>
                    {loadingMessages && (
                        <div className="flex justify-center items-center text-color-medium-emphasis">
                            <div className="h-12 w-12 relative">
                                <LoadingSpinner spinerStyle="border-link" />
                            </div>
                            Loading messages ...
                        </div>
                    )}

                    {!loadingMessages &&
                        messages &&
                        channel &&
                        channelUsers && (
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
                                reverse
                                rootMargin="100px"
                                scrollToItem={hasMention}
                                ref={containerRef}
                                className="overflow-y-auto max-w-full flex-1 scrollbar"
                            >
                                {bottomHasMore && (
                                    <div className="my-4 flex flex-col gap-y-4">
                                        <MessagePlaceHolder />
                                        <MessagePlaceHolder />
                                    </div>
                                )}
                                {sortedMessages.map((msg, index) => {
                                    let user = channelUsers.find(
                                        (mem) => mem.id === msg.user_id
                                    );
                                    if (!user)
                                        user = {
                                            id: msg.user_id,
                                            name: msg.user_name,
                                            notMember: true,
                                        };
                                    hasChanged = false;
                                    if (preValue) {
                                        if (
                                            preValue.user.id != user.id ||
                                            differenceInSeconds(
                                                preValue.msg.created_at,
                                                msg.created_at
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
                                        />
                                    );
                                })}
                            </InfiniteScroll>
                        )}

                    <div className="m-6 border border-color/15 pt-4 px-2 rounded-lg">
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
                                You're not allowed to post in thread. Contact
                                Admins or Channel managers for more information!
                            </h5>
                        )}
                    </div>
                </>
            )}
        </>
    );
}
