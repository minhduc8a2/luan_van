import Avatar from "@/Components/Avatar";
import { usePage } from "@inertiajs/react";
import React from "react";
import { FaAngleDown } from "react-icons/fa6";
import { FiHeadphones } from "react-icons/fi";
import { CgFileDocument } from "react-icons/cg";
import { FaPlus } from "react-icons/fa6";
import TipTapEditor from "@/Components/TipTapEditor";
import { router } from "@inertiajs/react";
import { useEffect, useRef } from "react";
import { differenceInSeconds } from "@/helpers/dateTimeHelper";

import Message from "./Message/Message";
import { setChannelUsers } from "@/Store/Slices/channelUsersSlice";
import {toggleHuddle } from "@/Store/Slices/huddleSlice";
import { setMessages, addMessage } from "@/Store/Slices/messagesSlice";
import { useSelector, useDispatch } from "react-redux";

export default function ChatArea() {
    const dispatch = useDispatch();
    const channel = useSelector((state) => state.channel);
    const channelUsers = useSelector((state) => state.channelUsers);
    const messages = useSelector((state) => state.messages);
    const { show } = useSelector((state) => state.huddle);

    const messageContainerRef = useRef(null);

    function onSubmit(content, fileObjects) {
        if (content == "<p></p>" && fileObjects.length == 0) return;
        router.post(route("message.store", { channel: channel.id }), {
            content,
            fileObjects,
        });
    }

    let preValue = null;
    let hasChanged = false;

    async function getChannelData() {
        const res = await axios.get(route("channel.show", channel.id));
        const jsonRes = await res;
        console.log(jsonRes.data);
        dispatch(setChannelUsers(jsonRes.data.channelUsers));
        dispatch(setMessages(jsonRes.data.messages));
    }
    useEffect(() => {
        dispatch(setMessages([]));
        getChannelData();
    }, [channel]);
    useEffect(() => {
        Echo.join(`channels.${channel.id}`)
            .here((users) => {})
            .joining((user) => {
                console.log("join", user, channel.name);
            })
            .leaving((user) => {
                console.log("leaving", user);
            })
            .listen("MessageEvent", (e) => {
                dispatch(addMessage(e.message));
                // console.log(e);
            })
            .error((error) => {
                console.error(error);
            });
        return () => {
            Echo.leave(`channels.${channel.id}`);
        };
    }, [channel]);
    useEffect(() => {
        if (messageContainerRef.current)
            messageContainerRef.current.scrollTop =
                messageContainerRef.current.scrollHeight;
    }, [messages]);

    return (
        <div className="bg-background  chat-area-container col-span-3 ">
            <div className="p-4 border-b border-b-white/10">
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
                                show ? "bg-green-700" : ""
                            }`}
                        >
                            <button
                                className={`flex items-center gap-x-1`}
                                onClick={() => {
                                    dispatch(toggleHuddle(channel));
                                    
                                }}
                            >
                                <FiHeadphones className="text-xl" />
                                <div className="text-sm ">Huddle</div>
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
                {messages.map((message, index) => {
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
            </div>
            <div className="m-6 border border-white/50 pt-4 px-2 rounded-lg">
                <TipTapEditor onSubmit={onSubmit} />
            </div>
        </div>
    );
}
