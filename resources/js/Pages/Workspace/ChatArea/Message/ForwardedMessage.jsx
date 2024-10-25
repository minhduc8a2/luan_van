import React, { useContext, useMemo } from "react";
import { UTCToDateTime, UTCToTime } from "@/helpers/dateTimeHelper";
import Avatar from "@/Components/Avatar";
import { isDocument, isImage, isVideo } from "@/helpers/fileHelpers";
import { useState } from "react";

import MessageToolbar from "./MessageToolbar";
import { router, usePage } from "@inertiajs/react";
import { groupReactions } from "@/helpers/reactionHelper";
import { useEffect } from "react";
import Reactions from "./Reactions";
import { FaAngleRight } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { setThreadedMessageId } from "@/Store/threadSlice";

import TipTapEditor from "@/Components/TipTapEditor";
import { editMessage as editMessageInStore } from "@/Store/channelsDataSlice";
import { getMentionsFromContent } from "@/helpers/tiptapHelper";

import ForwardMessage from "./ForwardMessage/ForwardMessage";
import Message from "./Message";
import { useChannel, useChannelUsers } from "@/helpers/customHooks";
import { useParams } from "react-router-dom";
import ThemeContext from "@/ThemeProvider";
export default function ForwardedMessage({
    message,
    user,
    hasChanged,
    index,
    threadStyle = false,
    messagableConnectionRef,

    noToolbar = false,
}) {
    const { auth } = usePage().props;
    const { channelId } = useParams();
    const { theme } = useContext(ThemeContext);
    const dispatch = useDispatch();
    const { channels } = useSelector((state) => state.channels);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const { channelUsers } = useChannelUsers(channelId);
    const { channel } = useChannel(channelId);
    const { messageId } = useSelector((state) => state.mention);
    const files = message.files || [];
    const [reactions, setReactions] = useState(
        message.reactions ? [...message.reactions] : []
    );
    const imageFiles = [];
    const videoFiles = [];
    const documentFiles = [];
    const deletedFiles = [];
    const otherFiles = [];
    files.forEach((file) => {
        if (isImage(file.type)) imageFiles.push(file);
        else if (isDocument(file.type)) documentFiles.push(file);
        else if (isVideo(file.type)) videoFiles.push(file);
        else if (file.deleted_at) deletedFiles.push(file);
        else otherFiles.push(file);
    });

    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [forwardedMessage, setForwardedMessage] = useState(null);

    const forwardedMessageUser = useMemo(() => {
        return workspaceUsers.find(
            (u) => u.id == message.forwarded_message.user_id
        );
    }, [workspaceUsers, message]);
    const forwardedMessageChannel = useMemo(() => {
        return channels.find(
            (cn) => cn.id == message.forwarded_message.channel_id
        );
    }, [channels, message]);
    const groupedReactions = useMemo(() => {
        return groupReactions(reactions, channelUsers, auth.user);
    }, [reactions]);
    useEffect(() => {
        setReactions(message.reactions ? [...message.reactions] : []);
    }, [message]);

    function editMessage(content, _, JSONContent) {
        let mentionsList = getMentionsFromContent(JSONContent);

        if (content == "<p></p>" && mentionsList.length == 0) return;
        dispatch(
            editMessageInStore({
                id: message.channel_id,
                data: { message_id: message.id, content },
            })
        );
        setIsEditing(false);
        router.post(
            route("message.update", message.id),
            {
                content,
                mentionsList,
            },
            {
                only: [],
                preserveState: true,
                preserveScroll: true,

                headers: {
                    "X-Socket-Id": Echo.socketId(),
                },
            }
        );
    }
    function reactToMessage(emojiId) {
        router.post(
            route("reaction.store", {
                channel: channel.id,
                message: message.id,
            }),
            {
                emoji_id: emojiId,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setReactions((pre) => [
                        ...pre,
                        { emoji_id: emojiId, user_id: auth.user.id },
                    ]);
                    messagableConnectionRef.current.whisper("messageReaction", {
                        method: "STORE",
                        emoji_id: emojiId,
                        user_id: auth.user.id,
                        id: message.id,
                    });
                },
            }
        );
    }
    function removeMessageReaction(emojiId) {
        router.post(
            route("reaction.delete", {
                channel: channel.id,
                message: message.id,
            }),
            {
                emoji_id: emojiId,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setReactions((pre) =>
                        pre.filter(
                            (reaction) =>
                                !(
                                    reaction.emoji_id === emojiId &&
                                    reaction.user_id === auth.user.id
                                )
                        )
                    );
                    messagableConnectionRef.current.whisper("messageReaction", {
                        method: "DELETE",
                        emoji_id: emojiId,
                        user_id: auth.user.id,
                        id: message.id,
                    });
                },
                onError: (errors) => {
                    console.log(errors);
                },
            }
        );
    }

    return (
        <div
            className={`message-container transition-all pl-8 pt-1 pr-4 pb-2 relative break-all group hover:bg-color/10 ${
                isHovered && !message.deleted_at ? "bg-color/10" : ""
            } ${hasChanged || index == 0 ? "pt-4" : "mt-0"}`}
            id={`message-${message.id}`}
        >
            <ForwardMessage
                message={forwardedMessage}
                show={forwardedMessage != null}
                onClose={() => setForwardedMessage(null)}
            />
            {!channel.is_archived && !message.deleted_at && !noToolbar && (
                <MessageToolbar
                    message={message}
                    threadStyle={threadStyle}
                    reactToMessage={reactToMessage}
                    setIsHovered={(pre) => setIsHovered(pre)}
                    setIsEditing={(pre) => setIsEditing(pre)}
                    user={user}
                    forwardFn={() => setForwardedMessage(message)}
                />
            )}
            {hasChanged || index == 0 ? (
                <Avatar
                    src={user.avatar_url}
                    className="w-10 h-10"
                    noStatus={true}
                />
            ) : (
                <div></div>
            )}
            <div className="mx-3 ">
                {hasChanged || index == 0 ? (
                    <div className="flex gap-x-2 items-baseline">
                        <div
                            className={`text-base font-bold leading-tight text-color-high-emphasis ${
                                user.notMember ? "line-through" : ""
                            }`}
                        >
                            {user.display_name || user.name}
                        </div>
                        {user.notMember && (
                            <span className="text-xs leading-tight text-color/75 font-extralight">
                                (Removed User)
                            </span>
                        )}
                        <span className="text-xs leading-tight text-color/75 font-extralight">
                            {threadStyle
                                ? UTCToDateTime(message.created_at)
                                : UTCToTime(message.created_at)}
                        </span>
                    </div>
                ) : (
                    ""
                )}

                {isEditing ? (
                    <div className="border rounded-lg border-color/15 p-2 mt-2">
                        <TipTapEditor
                            message={message}
                            onSubmit={editMessage}
                            isEditMessage={true}
                            closeEditMessageEditor={() => setIsEditing(false)}
                        />
                    </div>
                ) : (
                    <>
                        <div
                            className={`prose ${
                                theme.mode ? "prose-invert" : ""
                            } select-text`}
                            dangerouslySetInnerHTML={{
                                __html: message.deleted_at
                                    ? '<p class="italic text-color/50">Deleted message</p>'
                                    : message.content,
                            }}
                        ></div>
                        {message.is_edited == true && (
                            <span className="text-xs text-color/50">
                                (edited)
                            </span>
                        )}
                    </>
                )}
                <div className="border-l-4 border-l-color/15">
                    <Message
                        forwarded
                        threadStyle={true}
                        message={message.forwarded_message}
                        user={forwardedMessageUser}
                        forwardedMessageChannel={forwardedMessageChannel}
                        hasChanged={true}
                        index={0}
                    />
                </div>
                <Reactions
                    groupedReactions={groupedReactions}
                    reactToMessage={reactToMessage}
                    removeMessageReaction={removeMessageReaction}
                />

                {message.thread_messages_count > 0 && !threadStyle && (
                    <button
                        className="border hover:bg-black/25 flex justify-between items-center border-color/15 w-96 rounded-lg mt-4 py-1 px-4"
                        onClick={() =>
                            dispatch(setThreadedMessageId(message.id))
                        }
                    >
                        <div className="">
                            <span className="text-link text-sm">
                                {message.thread_messages_count} replies
                            </span>
                            <span className="text-sm ml-2">View thread</span>
                        </div>
                        <FaAngleRight className="text-sm text-color/50" />
                    </button>
                )}
            </div>
        </div>
    );
}
