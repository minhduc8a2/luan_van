import { setThreadMessage } from "@/Store/threadSlice";
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
export default function Thread() {
    const dispatch = useDispatch();
    const { channel, permissions } = usePage().props;
    const { threadMessage } = useSelector((state) => state.mention);
    const { message } = useSelector((state) => state.thread);
    const { channelUsers } = usePage().props;
    const [messages, setMessages] = useState([]);
    const nextPageUrlRef = useRef(null);
    const previousPageUrlRef = useRef(null);
    const messageContainerRef = useRef(null);
    const isInfiniteScrollRef = useRef(false);
    const user = channelUsers.filter((mem) => mem.id === message.user_id)[0];
    const [loadingMessages, setLoadingMessages] = useState(false);

    const preScrollPositionRef = useRef(null);

    const [newMessageReactionReceive, setNewMessageReactionReceive] =
        useState(null);
    const threadConnectionRef = useRef(null);
    const [newMessageReceived, setNewMessageReceived] = useState(true);

    let preValue = null;
    let hasChanged = false;
    const {
        ref: top_ref,
        inView: top_inView,
        entry: top_entry,
    } = useInView({
        /* Optional options */
        threshold: 0,
        initialInView: true,
    });
    const {
        ref: bottom_ref,
        inView: bottom_inView,
        entry: bottom_entry,
    } = useInView({
        /* Optional options */
        threshold: 0,
        initialInView: true,
    });
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
                message: message.id,
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
        threadConnectionRef.current = Echo.join(`threads.${message.id}`);
        threadConnectionRef.current
            .here((users) => {})
            .joining((user) => {
                // console.log("join thread", user);
            })
            .leaving((user) => {
                // console.log("leaving thread", user);
            })
            .listen("ThreadMessageEvent", (e) => {
                if (e.type == "newMessageCreated")
                    setMessages((pre) => [...pre, e.message]);
                else if (e.type == "messageEdited") {
                    setMessages((pre) => {
                        const temp = [...pre];
                        const messageIndex = pre.findIndex(
                            (m) => m.id == e.message.id
                        );
                        if (messageIndex >= 0) {
                            temp[messageIndex].content = e.message.content;
                        }
                        return temp;
                    });
                }
                console.log(e);
            })
            .listenForWhisper("messageReaction", (e) => {
                setNewMessageReactionReceive(e);
            })
            .error((error) => {
                console.error(error);
            });

        setLoadingMessages(true);
        axios
            .get(
                route("thread.messages", {
                    channel: channel.id,
                    message: message.id,
                }),
                {
                    params: threadMessage
                        ? { message_id: threadMessage.id }
                        : {},
                }
            )
            .then((response) => {
                console.log(response);
                nextPageUrlRef.current = response.data?.messages?.next_page_url;
                previousPageUrlRef.current =
                    response.data?.messages?.prev_page_url;
                setMessages(response.data?.messages?.data || []);
                setLoadingMessages(false);
            });
        return () => {
            setMessages([]);
            Echo.leave(`threads.${message.id}`);
        };
    }, [message.id]);

    useEffect(() => {
        if (!threadMessage) return;
        setLoadingMessages(true);
        axios
            .get(
                route("thread.messages", {
                    channel: channel.id,
                    message: message.id,
                }),
                {
                    params: threadMessage
                        ? { message_id: threadMessage.id }
                        : {},
                }
            )
            .then((response) => {
                console.log(response);
                nextPageUrlRef.current = response.data?.messages?.next_page_url;
                previousPageUrlRef.current =
                    response.data?.messages?.prev_page_url;
                setMessages(response.data?.messages?.data || []);
                setLoadingMessages(false);
            });
    }, [threadMessage]);

    const sortedMessages = useMemo(() => {
        const temp = [...messages];
        temp.sort((a, b) => compareDateTime(a.created_at, b.created_at));
        return temp;
    }, [messages]);

    useEffect(() => {
        if (newMessageReceived && threadMessage) setNewMessageReceived(false);
        if (newMessageReceived && !threadMessage) {
            console.log("new message received");
            if (messageContainerRef.current) {
                messageContainerRef.current.scrollTop =
                    messageContainerRef.current.scrollHeight -
                    messageContainerRef.current.clientHeight;
                setNewMessageReceived(false);
            }
        }
    }, [newMessageReceived, threadMessage, sortedMessages]);

    useEffect(() => {
        if (threadMessage) {
            const targetMessage = document.getElementById(
                `message-${threadMessage.id}`
            );
            console.log(targetMessage);
            if (targetMessage) {
                console.log("did it in thread");
                targetMessage.classList.add("bg-link/15");

                setTimeout(() => {
                    targetMessage.classList.remove("bg-link/15");
                }, 2000);
                targetMessage.scrollIntoView({
                    behavior: "instant",
                    block: "center",
                });
                setTimeout(() => {
                    dispatch(setMention(null));
                }, 100);
            }
        }
    }, [threadMessage, sortedMessages]);
    useEffect(() => {
        console.log("thread_top_inView", top_inView);
        if (!top_inView) return;
        if (!nextPageUrlRef.current) return;
        axios.get(nextPageUrlRef.current).then((response) => {
            if (response.status == 200) {
                nextPageUrlRef.current = response.data.messages.next_page_url;

                setMessages([...response.data.messages.data, ...messages]);
                isInfiniteScrollRef.current = true;
                preScrollPositionRef.current = {
                    oldScrollHeight: messageContainerRef.current.scrollHeight,
                    oldScrollTop: messageContainerRef.current.scrollTop,
                    position: "top",
                };
            }
        });
    }, [top_inView]); //hande scroll top

    useEffect(() => {
        console.log("bottom_thread_inView", bottom_inView);
        if (!bottom_inView) return;
        if (!previousPageUrlRef.current) return;
        axios.get(previousPageUrlRef.current).then((response) => {
            if (response.status == 200) {
                previousPageUrlRef.current =
                    response.data.messages.prev_page_url;
                setMessages([...response.data.messages.data, ...messages]);
                isInfiniteScrollRef.current = true;
                preScrollPositionRef.current = {
                    oldScrollHeight: messageContainerRef.current.scrollHeight,
                    oldScrollTop: messageContainerRef.current.scrollTop,
                    position: "bottom",
                };
            }
        });
    }, [bottom_inView]); //hande scroll bottom

    useEffect(() => {
        console.log("isInfiniteScroll");
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
    }, [sortedMessages]); //for infinite scrolling
   
    return (
        <div className="w-[35%] bg-background flex flex-col border-l border-white/15">
            <div className="p-4 z-10">
                <div className="flex justify-between font-bold text-lg opacity-75 items-center">
                    <div className="">Thread</div>
                    <button
                        onClick={() => dispatch(setThreadMessage(null))}
                        className="hover:bg-white/15 rounded-lg p-2"
                    >
                        <IoClose className="text-xl" />
                    </button>
                </div>
            </div>

            <div className="max-h-[30%] overflow-y-auto scrollbar">
                <Message
                    threadStyle={true}
                    message={message}
                    user={user}
                    hasChanged={true}
                    index={0}
                />
            </div>

            <div className="flex items-center gap-x-4 pl-4 my-4">
                <h3 className="text-sm text-white/75">
                    {message.thread.messages_count}{" "}
                    {message.thread.messages_count > 1 ? "replies" : "reply"}
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
            <div
                className="overflow-y-auto max-w-full flex-1 scrollbar"
                ref={messageContainerRef}
            >
                <ul className="mt-8">
                    <div ref={top_ref} className="h-4  "></div>
                    {sortedMessages.map((message, index) => {
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
                    <div ref={bottom_ref} className="h-4  "></div>
                </ul>
            </div>
            <div className="m-6 border border-white/15 pt-4 px-2 rounded-lg">
                {permissions.thread && (
                    <TipTapEditor onSubmit={onSubmit} message={message} />
                )}
                {!permissions.thread && (
                    <h5 className="mb-4 text-center ml-4">
                        You're not allowed to post in thread. Contact Admins or
                        Channel managers for more information!
                    </h5>
                )}
            </div>
        </div>
    );
}
