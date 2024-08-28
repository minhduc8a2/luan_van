import React from "react";
import { UTCToTime } from "@/helpers/dateTimeHelper";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Avatar from "@/Components/Avatar";
import {
    isDocument,
    isImage,
    getLogo,
    getDocumentType,
} from "@/helpers/fileHelpers";
import "react-photo-view/dist/react-photo-view.css";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { AiOutlineZoomIn } from "react-icons/ai";
import { AiOutlineZoomOut } from "react-icons/ai";
import { MdOutlineRotate90DegreesCcw } from "react-icons/md";
import { IoMdCloudDownload } from "react-icons/io";
import { useState } from "react";
import Overlay from "@/Components/Overlay/Overlay";
import { usePage } from "@inertiajs/react";
import FileItem from "@/Components/FileItem";

export default function Message({ message, user, hasChanged, index }) {
    const { publicAppUrl } = usePage().props;
    const attachments = message.attachments || [];
    const imageAttachments = [];
    const documentAttachments = [];
    const otherAttachments = [];
    attachments.forEach((attachment) => {
        if (isImage(attachment.type)) imageAttachments.push(attachment);
        else if (isDocument(attachment.type))
            documentAttachments.push(attachment);
        else otherAttachments.push(attachment);
    });
    const [openOverlay, setOpenOverlay] = useState(false);

    return (
        <div
            className={`message-container pl-8 pb-2  break-all hover:bg-white/10 ${
                hasChanged || index == 0 ? "pt-4" : "mt-0"
            }`}
        >
            {hasChanged || index == 0 ? (
                <Avatar src={user.avatar_url} noStatus={true} />
            ) : (
                <div></div>
            )}
            <div className="mx-3">
                {hasChanged || index == 0 ? (
                    <div className="flex gap-x-2">
                        <div className="text-sm font-bold">{user.name}</div>
                        <div className="text-xs">
                            {UTCToTime(message.updated_at)}
                        </div>
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
                {documentAttachments.length != 0 && (
                    <div className="flex gap-x-4 flex-wrap mt-4">
                        {documentAttachments.map((attachment) => {
                            return (
                                <div
                                    className=""
                                    key={"attachment_" + attachment.id}
                                >
                                    <button
                                        onClick={() => setOpenOverlay(true)}
                                    >
                                        <FileItem file={attachment} />
                                    </button>
                                    <Overlay
                                        show={openOverlay}
                                        onClose={() => setOpenOverlay(false)}
                                        toolbars={
                                            <a
                                                href={attachment.url}
                                                download={true}
                                            >
                                                <IoMdCloudDownload className="text-3xl" />
                                            </a>
                                        }
                                    >
                                        <div className="flex justify-center flex-col items-center max-h-[95vh] mt-4 w-fit ">
                                            <iframe
                                                width={
                                                    window.innerWidth > 900
                                                        ? window.innerWidth / 2
                                                        : window.innerWidth -
                                                          200
                                                }
                                                height={
                                                    window.innerHeight - 100
                                                }
                                                src={`https://docs.google.com/gview?url=${
                                                    publicAppUrl +
                                                    attachment.url
                                                }&embedded=true`}
                                            ></iframe>
                                        </div>
                                        <button
                                            onClick={() =>
                                                setOpenOverlay(false)
                                            }
                                        >
                                            close
                                        </button>
                                    </Overlay>
                                </div>
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
            </div>
        </div>
    );
}
