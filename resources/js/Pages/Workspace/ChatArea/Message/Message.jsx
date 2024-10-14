import React, { useMemo } from "react";
import { UTCToDateTime, UTCToTime } from "@/helpers/dateTimeHelper";
import Avatar from "@/Components/Avatar";
import { isDocument, isImage, isVideo } from "@/helpers/fileHelpers";

import { useState } from "react";
import FileItem from "@/Components/FileItem";
import DocumentAttachment from "./DocumentAttachment";
import Video from "@/Components/Video";
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
import Image from "@/Components/Image";
import { setNotificationPopup } from "@/Store/notificationPopupSlice";

import ForwardMessage from "./ForwardMessage/ForwardMessage";
import { setMention } from "@/Store/mentionSlice";
import { setProfile } from "@/Store/profileSlice";
import { useChannel } from "@/helpers/customHooks";
import { Link, useParams } from "react-router-dom";
import useGoToChannel from "@/helpers/useGoToChannel";
import useGoToMessage from "@/helpers/useGoToMessage";
import { MdError } from "react-icons/md";
import CustomedDialog from "@/Components/CustomedDialog";
export default function Message({
    message,
    user,
    hasChanged,
    index,
    threadStyle = false,
    messagableConnectionRef,
    newMessageReactionReceive,
    resetNewMessageReactionReceive,
    forwardedMessageChannel = null,
    forwarded = false,
}) {
    const { auth } = usePage().props;
    const { channelId, workspaceId } = useParams();
    const { channel } = useChannel(channelId);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const dispatch = useDispatch();
    const goToChannel = useGoToChannel();
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

    const [openOverlay, setOpenOverlay] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(null);
    const [forwardedMessage, setForwardedMessage] = useState(null);
    const goToMessageInHook = useGoToMessage();
    const groupedReactions = useMemo(() => {
        return groupReactions(reactions, workspaceUsers, auth.user);
    }, [reactions]);
    useEffect(() => {
        setReactions(message.reactions ? [...message.reactions] : []);
    }, [message]);

    useEffect(() => {
        if (
            newMessageReactionReceive &&
            newMessageReactionReceive.id == message.id
        ) {
            if (
                newMessageReactionReceive.method &&
                newMessageReactionReceive.method == "DELETE"
            ) {
                setReactions((pre) =>
                    pre.filter(
                        (reaction) =>
                            !(
                                reaction.emoji_id ===
                                    newMessageReactionReceive.emoji_id &&
                                reaction.user_id ===
                                    newMessageReactionReceive.user_id
                            )
                    )
                );
            } else
                setReactions((pre) => [
                    ...pre,
                    {
                        emoji_id: newMessageReactionReceive.emoji_id,
                        user_id: newMessageReactionReceive.user_id,
                    },
                ]);
            resetNewMessageReactionReceive();
        }
    }, [newMessageReactionReceive]);

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
    function deleteFile(file) {
        router.delete(
            route("files.delete", {
                file: file.id,
            }),
            {
                headers: {
                    "X-Socket-Id": Echo.socketId(),
                },
                preserveState: true,
                only: [],
                onError: (errors) => {
                    dispatch(
                        setNotificationPopup({
                            type: "error",
                            messages: Object.values(errors),
                        })
                    );
                },
            }
        );
    }

    function goToMessage() {
        goToMessageInHook(message);
    }
    // if (!channel) return "";
    return (
        <div
            className={`message-container transition-all pl-8 pt-1 pr-4 pb-2 relative break-all group hover:bg-white/10 ${
                isHovered && !message.deleted_at ? "bg-white/10" : ""
            } ${hasChanged || index == 0 ? "pt-4" : "mt-0"}`}
            id={
                forwarded
                    ? `forwarded-message-${message.id}`
                    : `message-${message.id}`
            }
        >
            <ForwardMessage
                message={forwardedMessage}
                show={forwardedMessage != null}
                onClose={() => setForwardedMessage(null)}
            />

            <CustomedDialog
                isOpen={!!showConfirm}
                onClose={() => setShowConfirm(false)}
            >
                <CustomedDialog.Title>Delete file</CustomedDialog.Title>
                <div className="flex flex-col gap-y-4">
                    <h5>
                        Are you sure you want to delete this file permanently?
                    </h5>
                    {showConfirm && (
                        <FileItem file={showConfirm} maxWidth="max-w-full" />
                    )}
                </div>
                <CustomedDialog.ActionButtons
                    btnName2="Delete"
                    onClickBtn2={() => {
                        deleteFile(showConfirm);
                        setShowConfirm(null);
                    }}
                />
            </CustomedDialog>

            {!channel.is_archived && !message.deleted_at && !forwarded && (
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
                        <button
                            className={`text-base hover:underline font-bold leading-tight ${
                                user.notMember ? "line-through" : ""
                            }`}
                            onClick={() => dispatch(setProfile(user.id))}
                        >
                            {user.display_name || user.name}
                        </button>
                        {user.notMember && (
                            <span className="text-xs leading-tight text-white/75 font-extralight">
                                (Removed User)
                            </span>
                        )}
                        <span className="text-xs leading-tight text-white/75 font-extralight">
                            {threadStyle
                                ? UTCToDateTime(message.created_at)
                                : UTCToTime(message.created_at)}
                        </span>
                    </div>
                ) : (
                    ""
                )}

                {isEditing ? (
                    <div className="border rounded-lg border-white/15 p-2 mt-2">
                        <TipTapEditor
                            channel={channel}
                            message={message}
                            onSubmit={editMessage}
                            isEditMessage={true}
                            closeEditMessageEditor={() => setIsEditing(false)}
                        />
                    </div>
                ) : (
                    <>
                        <div
                            className="prose prose-invert select-text"
                            dangerouslySetInnerHTML={{
                                __html: message.deleted_at
                                    ? '<p class="italic text-white/50">Deleted message</p>'
                                    : message.content,
                            }}
                        ></div>
                        {message.is_edited == true && (
                            <span className="text-xs text-white/50">
                                (edited)
                            </span>
                        )}

                        {message.isFailed && (
                            <div className="text-xs text-red-500 flex gap-x-2">
                                Failed! <MdError />
                            </div>
                        )}
                    </>
                )}
                {imageFiles.length != 0 && (
                    <div className="flex mt-4 gap-4 flex-wrap">
                        {imageFiles.map((file) => {
                            return (
                                <Image
                                    isInPhotoView={true}
                                    url={file.url}
                                    key={file.id}
                                    deleteFn={() => setShowConfirm(file)}
                                />
                            );
                        })}
                    </div>
                )}
                {videoFiles.length != 0 && (
                    <div className="flex gap-4 flex-wrap mt-4">
                        {videoFiles.map((file) => {
                            return (
                                <Video
                                    key={file.id}
                                    src={file.url}
                                    name={file.name}
                                    className="h-96 rounded-lg  "
                                    deleteFn={() => setShowConfirm(file)}
                                />
                            );
                        })}
                    </div>
                )}
                {documentFiles.length != 0 && (
                    <div className="flex gap-4 flex-wrap mt-4">
                        {documentFiles.map((file) => {
                            return (
                                <DocumentAttachment
                                    className="max-w-96"
                                    key={file.id}
                                    attachment={file}
                                    openOverlay={openOverlay}
                                    setOpenOverlay={(status) =>
                                        setOpenOverlay(status)
                                    }
                                    deleteFn={() => setShowConfirm(file)}
                                />
                            );
                        })}
                    </div>
                )}
                {otherFiles.length != 0 && (
                    <div className="flex gap-4 flex-wrap mt-4">
                        {otherFiles.map((file) => (
                            <a
                                href={file.url}
                                download={file.name}
                                key={file.id}
                            >
                                <FileItem file={file} />
                            </a>
                        ))}
                    </div>
                )}
                {deletedFiles.length != 0 && (
                    <div className="flex gap-4 flex-wrap mt-4">
                        {deletedFiles.map((file) => (
                            <FileItem file={file} key={file.id} />
                        ))}
                    </div>
                )}
                <Reactions
                    groupedReactions={groupedReactions}
                    reactToMessage={reactToMessage}
                    removeMessageReaction={removeMessageReaction}
                />
                {forwarded && forwardedMessageChannel && (
                    <div className="text-sm flex items-baseline gap-x-1 mt-4">
                        Posted in{" "}
                        <div
                            className="text-link hover:underline cursor-pointer"
                            onClick={() => {
                                goToChannel(
                                    forwardedMessageChannel.workspace_id,
                                    forwardedMessageChannel.id
                                );
                            }}
                        >
                            {forwardedMessageChannel.type != "DIRECT" ? (
                                <div className="flex items-baseline gap-x-1  ">
                                    {forwardedMessageChannel.type ==
                                    "PUBLIC" ? (
                                        <span className="">#</span>
                                    ) : (
                                        <FaLock className="text-sm inline" />
                                    )}{" "}
                                    {forwardedMessageChannel.name}
                                </div>
                            ) : (
                                "Direct channel"
                            )}
                        </div>
                        <span className="text-white/85 mx-2">|</span>
                        <button
                            className="text-link text-sm"
                            onClick={() => goToMessage()}
                        >
                            View Message
                        </button>
                    </div>
                )}
                {message.thread_messages_count > 0 &&
                    !threadStyle &&
                    !forwarded && (
                        <button
                            className="border hover:bg-black/25 flex justify-between items-center border-white/15 w-96 rounded-lg mt-4 py-1 px-4"
                            onClick={() =>
                                dispatch(setThreadedMessageId(message.id))
                            }
                        >
                            <div className="">
                                <span className="text-link text-sm">
                                    {message.thread_messages_count} replies
                                </span>
                                <span className="text-sm ml-2">
                                    View thread
                                </span>
                            </div>
                            <FaAngleRight className="text-sm text-white/50" />
                        </button>
                    )}
            </div>
        </div>
    );
}
