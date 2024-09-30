import React, { useContext, useMemo } from "react";

import TipTapEditor from "@/Components/TipTapEditor";
import { router, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { InView, useInView } from "react-intersection-observer";

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
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";

import { getMentionsFromContent } from "@/helpers/tiptapHelper";
import { getChannelName } from "@/helpers/channelHelper";

import { setMention } from "@/Store/mentionSlice";
import ChannelSettings from "./ChannelSettings/ChannelSettings";

import { FaLock } from "react-icons/fa";
import Button from "@/Components/Button";
import ForwardedMessage from "./Message/ForwardedMessage";
import { isHiddenUser } from "@/helpers/userHelper";
import Layout from "../Layout";
import Events from "./Events";
import Header from "./Header";
import { resetMessageCountForChannel } from "@/Store/channelsSlice";
import InitData from "./InitData";
import {
    useChannel,
    useChannelData,
    useChannelUsers,
} from "@/helpers/customHooks";

function ChatArea() {
    const { auth, channelId } = usePage().props;
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);

    const { permissions, messages } = useChannelData(channelId);

    const { channelUsers } = useChannelUsers(channelId);
    const { channels } = useSelector((state) => state.channels);
    const { channel } = useChannel(channelId);

    const messageContainerRef = useRef(null);

    const { messageId: threadMessageId } = useSelector((state) => state.thread);
    const { messageId, threadMessage: mentionThreadMessage } = useSelector(
        (state) => state.mention
    );

    const [focus, setFocus] = useState(1);
    const dispatch = useDispatch();

    const [loaded, setLoaded] = useState(false);

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
        return getChannelName(channel, channelUsers, auth.user);
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
    }, [messageId, groupedMessages]);

    const isChannelMember = useMemo(() => {
        if (!channel) return false;
        return channelUsers.some((u) => u.id === auth.user.id);
    }, [channelUsers]);
    return (
        <div className="flex-1 flex min-h-0 max-h-full w-full">
            <InitData loaded={loaded} setLoaded={(value) => setLoaded(value)} />
            {loaded && channel && (
                <>
                    <Events />

                    <div className="bg-background  chat-area-container flex-1 ">
                        <Header
                            channel={channel}
                            channelName={channelName}
                            channelUsers={channelUsers}
                        />
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
                                                            hasChanged={
                                                                hasChanged
                                                            }
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
                        </div>
                        <div className="m-6 border border-white/15 pt-4 px-2 rounded-lg ">
                            {permissions.chat && (
                                <TipTapEditor onSubmit={onSubmit} />
                            )}
                            {!permissions.chat &&
                                !channel?.is_archived &&
                                isChannelMember && (
                                    <h5 className="mb-4 text-center ml-4">
                                        You're not allowed to post in channel.
                                        Contact Admins or Channel managers for
                                        more information!
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
                </>
            )}
        </div>
    );
}
ChatArea.layout = (page) => <Layout children={page} />;

export default ChatArea;
