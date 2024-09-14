import React, { useMemo } from "react";
import { UTCToDateTime, UTCToTime } from "@/helpers/dateTimeHelper";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Avatar from "@/Components/Avatar";
import { isDocument, isImage, isVideo } from "@/helpers/fileHelpers";
import "react-photo-view/dist/react-photo-view.css";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { AiOutlineZoomIn } from "react-icons/ai";
import { AiOutlineZoomOut } from "react-icons/ai";
import { MdOutlineRotate90DegreesCcw } from "react-icons/md";
import { IoMdCloudDownload } from "react-icons/io";
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
import { setThreadMessage } from "@/Store/threadSlice";
import { setMessageId } from "@/Store/mentionSlice";

export default function Message({
    message,
    user,
    hasChanged,
    index,
    threadStyle = false,
    messagableConnectionRef,
    newMessageReactionReceive,
    resetNewMessageReactionReceive,
}) {
    const { auth, channel, channelUsers, permissions } = usePage().props;
    const dispatch = useDispatch();
    const { messageId } = useSelector((state) => state.mention);
    const attachments = message.attachments;
    const [reactions, setReactions] = useState([...message.reactions]);
    const imageAttachments = [];
    const videoAttachments = [];
    const documentAttachments = [];
    const otherAttachments = [];
    attachments.forEach((attachment) => {
        if (isImage(attachment.type)) imageAttachments.push(attachment);
        else if (isDocument(attachment.type))
            documentAttachments.push(attachment);
        else if (isVideo(attachment.type)) videoAttachments.push(attachment);
        else otherAttachments.push(attachment);
    });
    const [openOverlay, setOpenOverlay] = useState(false);
    const groupedReactions = useMemo(() => {
        return groupReactions(reactions, channelUsers, auth.user);
    }, [reactions]);
    useEffect(() => {
        setReactions([...message.reactions]);
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
            className={`message-container transition-all pl-8 pt-1 pr-4 pb-2 relative break-all group hover:bg-white/10 ${
                hasChanged || index == 0 ? "pt-4" : "mt-0"
            }`}
            id={`message-${message.id}`}
        >
            {!channel.is_archived && (
                <MessageToolbar
                    message={message}
                    threadStyle={threadStyle}
                    reactToMessage={reactToMessage}
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
                            className={`text-base font-bold leading-tight ${
                                user.notMember ? "line-through" : ""
                            }`}
                        >
                            {user.name}
                        </div>
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

                <div
                    className="prose prose-invert "
                    dangerouslySetInnerHTML={{
                        __html: message.content,
                    }}
                ></div>
                {imageAttachments.length != 0 && (
                    <div className="flex mt-4 gap-4 flex-wrap">
                        <PhotoProvider
                            toolbarRender={({
                                onScale,
                                scale,
                                rotate,
                                onRotate,
                                images,
                                index,
                            }) => {
                                return (
                                    <>
                                        <a
                                            href={images[index].src}
                                            className="PhotoView-Slider__toolbarIcon"
                                            download={true}
                                        >
                                            <IoMdCloudDownload className="text-xl" />
                                        </a>
                                        <button
                                            className="PhotoView-Slider__toolbarIcon"
                                            onClick={() =>
                                                onRotate(rotate + 90)
                                            }
                                        >
                                            <MdOutlineRotate90DegreesCcw className="text-xl" />
                                        </button>
                                        <button
                                            className="PhotoView-Slider__toolbarIcon"
                                            onClick={() => onScale(scale + 1)}
                                        >
                                            <AiOutlineZoomIn className="text-xl" />
                                        </button>
                                        <button
                                            className="PhotoView-Slider__toolbarIcon"
                                            onClick={() => onScale(scale - 1)}
                                        >
                                            <AiOutlineZoomOut className="text-xl" />
                                        </button>
                                    </>
                                );
                            }}
                        >
                            {imageAttachments.map((attachment) => {
                                return (
                                    <div
                                        className="h-64"
                                        key={"attachment_" + attachment.id}
                                    >
                                        <PhotoView src={attachment.url}>
                                            <img
                                                src={attachment.url}
                                                alt=""
                                                className="max-h-full rounded-lg cursor-pointer"
                                            />
                                        </PhotoView>
                                    </div>
                                );
                            })}
                        </PhotoProvider>
                    </div>
                )}
                {videoAttachments.length != 0 && (
                    <PhotoProvider>
                        <div className="flex gap-x-4 flex-wrap mt-4">
                            {videoAttachments.map((attachment) => {
                                return (
                                    <PhotoView
                                        key={"attachment_" + attachment.id}
                                        width={window.innerWidth}
                                        height={window.innerHeight}
                                        render={({ scale, attrs }) => {
                                            return (
                                                <div {...attrs}>
                                                    <Video
                                                        autoPlay
                                                        controls
                                                        muted
                                                        src={attachment.url}
                                                        className="h-full mx-auto rounded-lg"
                                                    />
                                                </div>
                                            );
                                        }}
                                    >
                                        <Video
                                            controls
                                            muted
                                            src={attachment.url}
                                            className="h-64 rounded-lg  "
                                        />
                                    </PhotoView>
                                );
                            })}
                        </div>
                    </PhotoProvider>
                )}
                {documentAttachments.length != 0 && (
                    <div className="flex gap-x-4 flex-wrap mt-4">
                        {documentAttachments.map((attachment) => {
                            return (
                                <DocumentAttachment
                                    key={attachment.id}
                                    attachment={attachment}
                                    openOverlay={openOverlay}
                                    setOpenOverlay={(status) =>
                                        setOpenOverlay(status)
                                    }
                                />
                            );
                        })}
                    </div>
                )}
                {otherAttachments.length != 0 && (
                    <div className="flex gap-x-4 flex-wrap mt-4">
                        {otherAttachments.map((attachment) => (
                            <a href={attachment.url} download={attachment.name}>
                                <FileItem file={attachment} />
                            </a>
                        ))}
                    </div>
                )}
                <Reactions
                    groupedReactions={groupedReactions}
                    reactToMessage={reactToMessage}
                    removeMessageReaction={removeMessageReaction}
                />
                {message.thread && !threadStyle && (
                    <button
                        className="border hover:bg-black/25 flex justify-between items-center border-white/15 w-96 rounded-lg mt-4 py-1 px-4"
                        onClick={() => dispatch(setThreadMessage(message))}
                    >
                        <div className="">
                            <span className="text-link text-sm">
                                {message.thread.messages_count} replies
                            </span>
                            <span className="text-sm ml-2">View thread</span>
                        </div>
                        <FaAngleRight className="text-sm text-white/50" />
                    </button>
                )}
            </div>
        </div>
    );
}
