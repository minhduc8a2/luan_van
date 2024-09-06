import Avatar from "@/Components/Avatar";

import React, { useContext, useMemo } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { FiHeadphones } from "react-icons/fi";
import { CgFileDocument } from "react-icons/cg";
import { FaPlus } from "react-icons/fa6";
import TipTapEditor from "@/Components/TipTapEditor";
import { router, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { InView } from "react-intersection-observer";
import {
    compareDateTime,
    differenceInSeconds,
    formatDDMMYYY,
    groupMessagesByDate,
} from "@/helpers/dateTimeHelper";

import Message from "./Message/Message";

import { toggleHuddle } from "@/Store/huddleSlice";

import { useSelector, useDispatch } from "react-redux";
import { EditDescriptionForm } from "./EditDescriptionForm";
import axios from "axios";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";

export default function ChatArea() {
    const {
        users,
        auth,
        channel,
        channelUsers,
        messages: initMessages,
    } = usePage().props;

    const dispatch = useDispatch();
    const { channel: huddleChannel } = useSelector((state) => state.huddle);
    const [infiniteScroll, setInfiniteScroll] = useState(false);
    const messageContainerRef = useRef(null);
    const [nextPageUrl, setNextPageUrl] = useState(initMessages.next_page_url);
    const [messages, setMessages] = useState(initMessages?.data);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const prevScrollHeightRef = useRef(0);
    function onSubmit(content, fileObjects) {
        console.log("submit on channel: ", channel);
        if (content == "<p></p>" && fileObjects.length == 0) return;
        router.post(route("message.store", { channel: channel.id }), {
            content,
            fileObjects,
        });
    }

    let preValue = null;
    let hasChanged = false;

    let isDirectChannel = channel.type == "DIRECT";
    if (isDirectChannel) {
        try {
            const userId = channel.name
                .split("_")
                .find((id) => id != auth.user.id);

            const user = users.find((user) => user.id == userId);
            channel.name = user.name;
        } catch (error) {}
    }
    const groupedMessages = useMemo(() => {
        const gMessages = groupMessagesByDate(messages);
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
        setMessages(initMessages?.data);
        setNextPageUrl(initMessages?.next_page_url);
    }, [channel.id]);

    useEffect(() => {
        console.log("Channel: ", channel.name);
        Echo.join(`channels.${channel.id}`)
            .here((users) => {})
            .joining((user) => {
                console.log("join", user, channel.name);
            })
            .leaving((user) => {
                console.log("leaving", user);
            })
            .listen("MessageEvent", (e) => {
                setMessages((pre) => [...pre, e.message]);
                // console.log(e);
            })
            .error((error) => {
                console.error(error);
            });
        return () => {
            Echo.leave(`channels.${channel.id}`);
        };
    }, [channel.id]);
    useEffect(() => {
        if (messageContainerRef.current)
            if (!infiniteScroll) {
                messageContainerRef.current.scrollTop =
                    messageContainerRef.current.scrollHeight;
            } else {
                setInfiniteScroll(false);
                const newScrollHeight =
                    messageContainerRef.current.scrollHeight;
                messageContainerRef.current.scrollTop =
                    newScrollHeight -
                    prevScrollHeightRef.current +
                    messageContainerRef.current.scrollTop;
            }
    }, [messages]);

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

    const welcomeMessage = useMemo(() => {
        const welcomeMessages = [
            `📣You’re looking at the #${channel.name} channel`,
            `👋 Welcome to the #${channel.name} channel`,
            `🥳 You’ve found the #${channel.name} channel`,
        ];
        if (channel.name.includes("all-")) return welcomeMessages[0];
        if (channel.name.includes("social")) return welcomeMessages[2];
        return welcomeMessages[1];
    }, [channel.id]);
    return (
        <div className="bg-background  chat-area-container col-span-3 ">
            <div className="p-4 border-b border-b-white/10 z-10">
                <div className="flex justify-between font-bold text-lg opacity-75">
                    <div className="flex items-center gap-x-2">
                        <div className=""># {channel.name}</div>
                        <FaAngleDown className="text-sm" />
                    </div>
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
                            <button
                                className={`flex items-center gap-x-1 `}
                                onClick={handleHuddleButtonClicked}
                            >
                                <FiHeadphones className="text-xl" />
                                <div className={`text-sm `}>Huddle</div>
                            </button>
                            {/* <div className="flex items-center gap-x-1">
                              <span className="text-sm opacity-25 ">|</span>
                              <FaAngleDown className="text-xs" />
                          </div> */}
                        </div>

                        <div className="p-1 border border-white/15 rounded-lg ">
                            <CgFileDocument className="text-xl" />
                        </div>
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
                {loadingMessages && (
                    <div className="flex justify-center items-center">
                        <div className="h-12 w-12 relative">
                            <OverlayLoadingSpinner spinerStyle="border-link" />
                        </div>
                        Loading messages ...
                    </div>
                )}
                <InView
                    onChange={(inView, entry) => {
                        if (inView && nextPageUrl) {
                            setInfiniteScroll(true);
                            setLoadingMessages(true);
                            prevScrollHeightRef.current =
                                messageContainerRef.current.scrollHeight;
                            axios.get(nextPageUrl).then((response) => {
                                if (response.status == 200) {
                                    setLoadingMessages(false);
                                    setNextPageUrl(
                                        response.data.messages.next_page_url
                                    );
                                    setMessages((pre) => [
                                        ...response.data.messages.data,
                                        ...pre,
                                    ]);
                                }
                            });
                        }
                    }}
                ></InView>
                {groupedMessages.map(({ date, mgs }, pIndex) => {
                    return (
                        <div className="relative pb-4" key={date}>
                            <div className="border-t border-white/15 translate-y-3"></div>
                            <div className="text-xs border border-white/15 rounded-full h-6 flex items-center px-4 sticky top-0 left-1/2 -translate-x-1/2  w-fit bg-background z-20">
                                {date}
                            </div>

                            <ul className="">
                                {mgs.map((message, index) => {
                                    const user = channelUsers.filter(
                                        (mem) => mem.id === message.user_id
                                    )[0];
                                    hasChanged = false;
                                    if (preValue) {
                                        if (
                                            preValue.user.id != user.id ||
                                            differenceInSeconds(
                                                preValue.message.updated_at,
                                                message.updated_at
                                            ) > 10
                                        ) {
                                            hasChanged = true;
                                            preValue = { user, message };
                                        }
                                    } else preValue = { user, message };
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
            </div>
            <div className="m-6 border border-white/50 pt-4 px-2 rounded-lg">
                <TipTapEditor onSubmit={(a, b) => onSubmit(a, b)} />
            </div>
        </div>
    );
}
