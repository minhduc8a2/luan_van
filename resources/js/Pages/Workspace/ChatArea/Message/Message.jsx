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
import { LuSmilePlus } from "react-icons/lu";
import FileItem from "@/Components/FileItem";
import DocumentAttachment from "./DocumentAttachment";
import Video from "@/Components/Video";
import MessageToolbar from "./MessageToolbar";
import { router, usePage } from "@inertiajs/react";
import { groupReactions } from "@/helpers/reactionHelper";
import Tooltip from "@/Components/Tooltip";
import { useEffect } from "react";
export default function Message({
    message,
    user,
    hasChanged,
    index,
    threadStyle = false,
    channelConnectionRef,
    newMessageReactionReceive,
    resetNewMessageReactionReceive,
}) {
    const { auth, channel, channelUsers } = usePage().props;
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
        if (
            newMessageReactionReceive &&
            newMessageReactionReceive.id == message.id
        ) {
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
    function reactToMessage(emoji) {
        router.post(
            route("reaction.store", {
                channel: channel.id,
                message: message.id,
            }),
            {
                emoji_id: emoji.id,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setReactions((pre) => [
                        ...pre,
                        { emoji_id: emoji.id, user_id: auth.user.id },
                    ]);
                    channelConnectionRef.current.whisper("messageReaction", {
                        emoji_id: emoji.id,
                        user_id: auth.user.id,
                        id: message.id,
                    });
                },
            }
        );
    }
    return (
        <div
            className={`message-container pl-8 pr-4 pb-2 relative break-all group hover:bg-white/10 ${
                hasChanged || index == 0 ? "pt-4" : "mt-0"
            }`}
        >
            <MessageToolbar
                message={message}
                threadStyle={threadStyle}
                reactToMessage={reactToMessage}
            />
            {hasChanged || index == 0 ? (
                <Avatar
                    src={user.avatar_url}
                    className="w-10 h-10"
                    noStatus={true}
                />
            ) : (
                <div></div>
            )}
            <div className="mx-3">
                {hasChanged || index == 0 ? (
                    <div className="flex gap-x-2 items-end">
                        <div className="text-base font-bold leading-tight">
                            {user.name}
                        </div>
                        <span className="text-xs leading-tight text-white/75 font-extralight">
                            {threadStyle
                                ? UTCToDateTime(message.updated_at)
                                : UTCToTime(message.updated_at)}
                        </span>
                    </div>
                ) : (
                    ""
                )}

                <div
                    className="prose prose-invert "
                    dangerouslySetInnerHTML={{
                        __html: generateHTML(JSON.parse(message.content), [
                            StarterKit,
                        ]),
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
                                                className="max-h-full rounded-lg"
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
                <div className="flex gap-x-2 mt-4 items-center">
                    {groupedReactions.map((reaction) => (
                        <Tooltip
                            key={reaction.emoji_id}
                            content={
                                <ul className="whitespace-nowrap p-1">
                                    {reaction.users.map((user) => (
                                        <li key={user.id} className="text-xs">
                                            {user.name}
                                        </li>
                                    ))}
                                </ul>
                            }
                        >
                            <button
                                className={`${
                                    reaction.hasReacted
                                        ? "bg-blue-500/25"
                                        : "bg-white/15"
                                } rounded-full px-[6px] flex items-center gap-x-1 py-[2px]`}
                            >
                                <div className="text-sm">
                                    {reaction.nativeEmoji}
                                </div>
                                <div className="text-sm w-2 font-semibold">
                                    {reaction.users.length}
                                </div>
                            </button>
                        </Tooltip>
                    ))}
                    {groupedReactions.length > 0 && (
                        <div className="bg-white/15 rounded-full px-[8px] flex items-center gap-x-1 py-[4px]">
                            <LuSmilePlus />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
