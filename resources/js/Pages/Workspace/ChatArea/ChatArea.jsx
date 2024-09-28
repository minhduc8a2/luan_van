import Avatar from "@/Components/Avatar";

import React, { useContext, useMemo } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { FiHeadphones } from "react-icons/fi";
import { CgFileDocument } from "react-icons/cg";
import { FaPlus } from "react-icons/fa6";
import TipTapEditor from "@/Components/TipTapEditor";
import { router, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { InView, useInView } from "react-intersection-observer";
import { TfiReload } from "react-icons/tfi";
import {
    compareDateTime,
    differenceInSeconds,
    formatDDMMYYY,
    groupListByDate,
} from "@/helpers/dateTimeHelper";

import Message from "./Message/Message";

import { toggleHuddle } from "@/Store/huddleSlice";

import { useSelector, useDispatch } from "react-redux";
import { EditDescriptionForm } from "./EditDescriptionForm";
import axios from "axios";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";
import Thread from "./Thread";
import { getMentionsFromContent } from "@/helpers/tiptapHelper";
import { getChannelName } from "@/helpers/channelHelper";
import {
    addMessage,
    addThreadMessagesCount,
    addThreadToMessages,
    deleteMessage,
    editMessage,
    setMessages,
    subtractThreadMessagesCount,
} from "@/Store/messagesSlice";
import { setMention } from "@/Store/mentionSlice";
import ChannelSettings from "./ChannelSettings/ChannelSettings";
import { resetMessageCountForChannel } from "@/Store/newMessageCountsMapSlice";
import { setThreadedMessageId } from "@/Store/threadSlice";
import OverlayNotification from "@/Components/Overlay/OverlayNotification";
import { FaLock } from "react-icons/fa";
import Button from "@/Components/Button";
import ForwardedMessage from "./Message/ForwardedMessage";
import { isHiddenUser } from "@/helpers/userHelper";
import Layout from "../Layout";
import Events from "./Events";

function ChatArea() {
    const {
        auth,
        channel,
        channels,
        channelUsers,
        directChannels,
        messages: initMessages,
        users,
        permissions,
    } = usePage().props;
    const messageContainerRef = useRef(null);
    const {
        ref: top_ref,
        inView: top_inView,
        entry: top_entry,
    } = useInView({
        threshold: 0.1,
        root: messageContainerRef.current,
        rootMargin: "500px",
    });
    const {
        ref: bottom_ref,
        inView: bottom_inView,
        entry: bottom_entry,
    } = useInView({
        threshold: 0.1,
        root: messageContainerRef.current,
        rootMargin: "500px",
    });
    const { messageId: threadMessageId } = useSelector((state) => state.thread);
    const { messageId, threadMessage: mentionThreadMessage } = useSelector(
        (state) => state.mention
    );
    const { messages } = useSelector((state) => state.messages);
    const [focus, setFocus] = useState(1);
    const dispatch = useDispatch();
    const { channel: huddleChannel } = useSelector((state) => state.huddle);

    const nextPageUrlRef = useRef(initMessages.next_page_url);
    const previousPageUrlRef = useRef(initMessages.prev_page_url);
    const isInfiniteScrollRef = useRef(false);
    const preScrollPositionRef = useRef(null);
    const [newMessageReceived, setNewMessageReceived] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [newMessageReactionReceive, setNewMessageReactionReceive] =
        useState(null);
    const channelConnectionRef = useRef(null);
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
    //reset state on channel changes
    useEffect(() => {
        dispatch(setMessages([...initMessages?.data]));
        nextPageUrlRef.current = initMessages?.next_page_url;
        previousPageUrlRef.current = initMessages?.prev_page_url;
        dispatch(resetMessageCountForChannel(channel));
        router.post(
            route("channel.last_read", channel.id),
            {},
            { preserveScroll: true, preserveState: true, only: ["channels"] }
        );
        return () => {
            setNewMessageReceived(true);
            isInfiniteScrollRef.current = false;
            preScrollPositionRef.current = null;
            router.post(
                route("channel.last_read", channel.id),
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    only: ["channels"],
                }
            );
        };
    }, [channel.id]);
    useEffect(() => {
        if (!messageId) return;
        console.log("set new messages on mentios?");
        dispatch(setMessages([...initMessages?.data]));
        nextPageUrlRef.current = initMessages?.next_page_url;
        previousPageUrlRef.current = initMessages?.prev_page_url;
    }, [messageId, initMessages]);

    const groupedMessages = useMemo(() => {
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
        channelConnectionRef.current = Echo.join(`channels.${channel.id}`);
        channelConnectionRef.current
            .here((users) => {})
            // .joining((user) => {
            //     console.log("join", user, channel.name);
            // })
            // .leaving((user) => {
            //     console.log("leaving", user);
            // })
            .listen("MessageEvent", (e) => {
                console.log("messageEvent", e);
                if (
                    e.type == "newMessageCreated" &&
                    !isHiddenUser(users, e.message?.user_id)
                ) {
                    dispatch(addMessage(e.message));
                    setNewMessageReceived(true);
                } else if (e.type == "messageEdited")
                    dispatch(
                        editMessage({
                            message_id: e.message.id,
                            content: e.message.content,
                        })
                    );
                else if (e.type == "messageDeleted") {
                    if (threadMessageId == e.message?.id)
                        dispatch(setThreadedMessageId(null));
                    dispatch(deleteMessage(e.message?.id));
                }

                // console.log(e);
            })

            .listen("ThreadMessageEvent", (e) => {
                if (
                    e.type == "newMessageCreated" &&
                    !isHiddenUser(users, e.message?.user_id)
                )
                    dispatch(addThreadMessagesCount(e.threadedMessageId));
                else if (
                    e.type == "messageDeleted" &&
                    !isHiddenUser(users, e.message?.user_id)
                )
                    dispatch(subtractThreadMessagesCount(e.threadedMessageId));
                // console.log(e);
            })
            .listen("SettingsEvent", (e) => {
                switch (e.type) {
                    case "addManagers":
                    case "removeManager":
                        router.reload({
                            only: [
                                "managers",
                                "permissions",
                                "channelPermissions",
                            ],
                        });
                        break;
                    case "editDescription":
                    case "editName":
                    case "changeType":
                        router.reload({
                            only: [
                                "channel",
                                "channels",
                                "permissions",
                                "channelPermissions",
                            ],
                        });
                        break;
                    case "leave":
                        router.reload({
                            only: ["channelUsers"],
                        });
                        break;
                    case "removeUserFromChannel":
                    case "addUsersToChannel":
                        router.reload({
                            only: [
                                "channelUsers",
                                "channels",

                                "permissions",
                                "channelPermissions",
                            ],
                        });
                        break;
                    case "updateChannelPermissions":
                        router.reload({
                            only: ["permissions", "channelPermissions"],
                        });
                        break;

                    case "archiveChannel":
                        router.reload({
                            only: [
                                "channel",
                                "channels",

                                "permissions",
                                "channelPermissions",
                            ],
                        });
                        break;
                    case "join":
                        router.reload({
                            only: ["channelUsers"],
                        });
                        break;
                    default:
                        break;
                }
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
    }, [channel.id, huddleChannel, threadMessageId]);

    function handleHuddleButtonClicked() {
        if (huddleChannel && huddleChannel.id != channel.id) {
            if (confirm("Are you sure you want to switch to other huddle"))
                dispatch(
                    toggleHuddle({
                        channel,
                        user: auth.user,
                    })
                );
        } else {
            dispatch(
                toggleHuddle({
                    channel,
                    user: auth.user,
                })
            );
        }
    }

    const channelName = useMemo(
        () => getChannelName(channel, channelUsers, auth.user),
        [channel]
    );
    const welcomeMessage = useMemo(() => {
        const welcomeMessages = [
            `📣You’re looking at the #${channelName} channel`,
            `👋 Welcome to the #${channelName} channel`,
            `🥳 You’ve found the #${channelName} channel`,
        ];
        if (channelName.includes("all-")) return welcomeMessages[0];
        if (channelName.includes("social")) return welcomeMessages[2];
        return welcomeMessages[1];
    }, [channel.id]);

    useEffect(() => {
        if (newMessageReceived && messageId) setNewMessageReceived(false);
        if (newMessageReceived && !messageId) {
            console.log("new message received");
            if (messageContainerRef.current) {
                messageContainerRef.current.scrollTop =
                    messageContainerRef.current.scrollHeight -
                    messageContainerRef.current.clientHeight;
                setNewMessageReceived(false);
            }
        }
    }, [newMessageReceived, messageId, groupedMessages]); //why messageId? beacause it needs track new messageId value

    useEffect(() => {
        if (messageId) {
            const targetMessage = document.getElementById(
                `message-${messageId}`
            );

            if (targetMessage) {
                targetMessage.scrollIntoView({
                    behavior: "instant",
                    block: "start",
                });
                targetMessage.classList.add("bg-link/15");

                setTimeout(() => {
                    targetMessage.classList.remove("bg-link/15");
                }, 2000);
                if (!mentionThreadMessage) {
                    setTimeout(() => {
                        dispatch(setMention(null));
                    }, 300);
                }
            }
        }
    }, [
        messageId,
        groupedMessages,
    ]); /* groupedMessages changes based on messages, make rerender again, so
        we know that groupedMessages is the last state changes, so it should trigger target message element again
    */

    useEffect(() => {
        // console.log("top_inView", top_inView);
        if (!top_inView) return;
        if (!nextPageUrlRef.current) return;
        setLoadingMessages(true);
        axios
            .get(nextPageUrlRef.current)
            .then((response) => {
                if (response.status == 200) {
                    nextPageUrlRef.current =
                        response.data.messages.next_page_url;
                    dispatch(
                        setMessages([
                            ...response.data.messages.data,
                            ...messages,
                        ])
                    );
                    isInfiniteScrollRef.current = true;
                    preScrollPositionRef.current = {
                        oldScrollHeight:
                            messageContainerRef.current.scrollHeight,
                        oldScrollTop: messageContainerRef.current.scrollTop,
                        position: "top",
                    };
                }
            })
            .finally(() => {
                setLoadingMessages(false);
            });
    }, [top_inView]); //hande scroll top

    useEffect(() => {
        // console.log("bottom_inView", bottom_inView);
        if (!bottom_inView) return;
        if (!previousPageUrlRef.current) return;
        setLoadingMessages(true);
        axios
            .get(previousPageUrlRef.current)
            .then((response) => {
                if (response.status == 200) {
                    previousPageUrlRef.current =
                        response.data.messages.prev_page_url;
                    dispatch(
                        setMessages([
                            ...response.data.messages.data,
                            ...messages,
                        ])
                    );
                    isInfiniteScrollRef.current = true;
                    preScrollPositionRef.current = {
                        oldScrollHeight:
                            messageContainerRef.current.scrollHeight,
                        oldScrollTop: messageContainerRef.current.scrollTop,
                        position: "bottom",
                    };
                }
            })
            .finally(() => {
                setLoadingMessages(false);
            });
    }, [bottom_inView]); //hande scroll bottom

    useEffect(() => {
        // console.log("isInfiniteScroll");
        if (!isInfiniteScrollRef.current) return;
        if (!messageContainerRef.current) return;
        if (!preScrollPositionRef.current) return;
        if (preScrollPositionRef.current.position == "top") {
            console.log("scroll top persists");
            messageContainerRef.current.scrollTop =
                messageContainerRef.current.scrollHeight -
                preScrollPositionRef.current.oldScrollHeight +
                preScrollPositionRef.current.oldScrollTop;
            isInfiniteScrollRef.current = false;
        } else if (preScrollPositionRef.current.position == "bottom") {
            console.log("scroll bottom persists");
            messageContainerRef.current.scrollTop =
                preScrollPositionRef.current.oldScrollTop;
            isInfiniteScrollRef.current = false;
        }
    }, [groupedMessages]); //for infinite scrolling

    const isChannelMember = useMemo(
        () =>
            channels.find((cn) => cn.id === channel.id) ||
            directChannels.find((cn) => cn.id === channel.id),
        [channels, channel]
    );
    return (
        <div className="flex-1 flex min-h-0 max-h-full w-full">
            <Events />
            <div className="bg-background  chat-area-container flex-1 ">
                <div className="p-4 border-b border-b-white/10 z-10">
                    <div className="flex justify-between font-bold text-lg opacity-75">
                        <div className="flex items-center gap-x-4">
                            <ChannelSettings
                                channelName={channelName}
                                buttonNode={
                                    <div className="flex items-center gap-x-2">
                                        <div className="flex items-baseline gap-x-1">
                                            {channel.type == "PUBLIC" ? (
                                                <span className="text-xl">
                                                    #
                                                </span>
                                            ) : (
                                                <FaLock className="text-sm inline" />
                                            )}{" "}
                                            {channelName}
                                        </div>

                                        <FaAngleDown className="text-sm" />
                                    </div>
                                }
                            />
                        </div>
                        <div className="">
                            {!channel.is_archived && (
                                <div className="flex items-center gap-x-4 ">
                                    <div className="flex items-center p-1 border  border-white/15 rounded-lg px-2">
                                        <ul className="flex">
                                            {channelUsers.map((user) => (
                                                <li
                                                    key={user.id}
                                                    className="-ml-2 first:ml-0  "
                                                >
                                                    <Avatar
                                                        src={user.avatar_url}
                                                        noStatus={true}
                                                        className="w-6 h-6 border-2  border-background"
                                                        roundedClassName="rounded-lg"
                                                    />
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="text-xs ml-2">
                                            {channelUsers.length}
                                        </div>
                                    </div>
                                    <div
                                        className={`flex items-center p-1 border border-white/15 rounded-lg px-2 gap-x-3 font-normal  ${
                                            huddleChannel ? "bg-green-700 " : ""
                                        }`}
                                    >
                                        {permissions.huddle ? (
                                            <button
                                                className={`flex items-center gap-x-1 `}
                                                onClick={
                                                    handleHuddleButtonClicked
                                                }
                                            >
                                                <FiHeadphones className="text-xl" />
                                                <div className={`text-sm `}>
                                                    Huddle
                                                </div>
                                            </button>
                                        ) : (
                                            <OverlayNotification
                                                buttonNode={
                                                    <button
                                                        className={`flex items-center gap-x-1 `}
                                                    >
                                                        <FiHeadphones className="text-xl" />
                                                        <div
                                                            className={`text-sm `}
                                                        >
                                                            Huddle
                                                        </div>
                                                    </button>
                                                }
                                                className="p-3"
                                            >
                                                <h5 className="mb-4  ">
                                                    You're not allowed to huddle
                                                    in channel. Contact Admins
                                                    or Channel managers for more
                                                    information!
                                                </h5>
                                            </OverlayNotification>
                                        )}
                                        {/* <div className="flex items-center gap-x-1">
                              <span className="text-sm opacity-25 ">|</span>
                              <FaAngleDown className="text-xs" />
                          </div> */}
                                    </div>

                                    <div className="p-1 border border-white/15 rounded-lg ">
                                        <CgFileDocument className="text-xl" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-x-2 opacity-75 mt-4">
                        <FaPlus className="text-xs" />
                        <div className="text-sm">Add bookmarks</div>
                    </div>
                </div>
                <div
                    className="overflow-y-auto max-w-full scrollbar"
                    ref={messageContainerRef}
                >
                    <div className="p-8">
                        <h1 className="text-3xl font-extrabold text-white/85">
                            {" "}
                            {welcomeMessage}
                        </h1>

                        <div className="text-white/85 mt-2">
                            {channel.description}{" "}
                            <div className="inline-block">
                                <EditDescriptionForm />
                            </div>
                        </div>
                    </div>
                    <div className="" ref={top_ref}>
                        {loadingMessages && (
                            <div className="flex gap-x-2 items-center">
                                <div className="h-6 w-6 relative">
                                    <OverlayLoadingSpinner />
                                </div>
                                <div className="text-xs">
                                    Loading messages...
                                </div>
                            </div>
                        )}
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
                                        let user = users.find(
                                            (mem) => mem.id === message.user_id
                                        );
                                        if (
                                            !channelUsers.find(
                                                (u) => u.id == user.id
                                            )
                                        ) {
                                            users.notMember = true;
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
                                                preValue.user.id != user.id ||
                                                differenceInSeconds(
                                                    preValue.message.created_at,
                                                    message.created_at
                                                ) > 10
                                            ) {
                                                hasChanged = true;
                                                preValue = { user, message };
                                            }
                                        } else preValue = { user, message };
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
                    <div ref={bottom_ref} className=""></div>
                </div>
                <div className="m-6 border border-white/15 pt-4 px-2 rounded-lg ">
                    {permissions.chat && <TipTapEditor onSubmit={onSubmit} />}
                    {!permissions.chat &&
                        !channel.is_archived &&
                        isChannelMember && (
                            <h5 className="mb-4 text-center ml-4">
                                You're not allowed to post in channel. Contact
                                Admins or Channel managers for more information!
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
                    {channel.is_archived == true && (
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
        </div>
    );
}
ChatArea.layout = (page) => <Layout children={page} />;

export default ChatArea;
